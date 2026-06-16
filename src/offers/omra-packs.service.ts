import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  createdAtBounds,
  listMeta,
  normalizePagination,
} from '../common/pagination.util';
import { assertContentLifecycleTransition } from '../common/status-transitions';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateOmraPackDto, UpdateOmraPackDto } from './dto/omra-pack.dto';

function parseDate(value: string | undefined | null): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(value);
}

function toJsonInput(
  v: unknown,
): Prisma.InputJsonValue | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  return v as Prisma.InputJsonValue;
}

@Injectable()
export class OmraPacksService {
  constructor(private readonly prisma: PrismaService) {}

  async publishedForPublic() {
    return this.prisma.omraPack.findMany({
      where: {
        status: 'published',
      },
      orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }]
    });
  }

  async publishedOneBySlug(slug: string) {
    const offer = await this.prisma.omraPack.findFirst({
      where: {
        slug,
        status: 'published',
      }
    });

    if (!offer) {
      throw new NotFoundException('Published omra pack not found');
    }

    return offer;
  }

  async publishedOneById(id: string) {
    const offer = await this.prisma.omraPack.findFirst({
      where: {
        id,
        status: 'published',
      }
    });

    if (!offer) {
      throw new NotFoundException('Published omra pack not found');
    }

    return offer;
  }

  async upcomingDeparturePeriods(months = 6) {
    const now = new Date();
    const until = new Date();
    until.setMonth(until.getMonth() + months);

    const rows = await this.prisma.omraPack.findMany({
      where: {
        status: 'published',
        departureDate: { gte: now, lte: until } as any,
      },
      orderBy: { departureDate: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        departureDate: true,
        returnDate: true,
        totalSeats: true,
        availableSeats: true,
      },
    });

    const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
    const monthOnlyFormatter = new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
    });

    const capitalize = (value: string) =>
      value.charAt(0).toUpperCase() + value.slice(1);

    const formatMonthYear = (date: Date) =>
      capitalize(monthFormatter.format(date));

    const formatMonthOnly = (date: Date) => monthOnlyFormatter.format(date);

    return rows
      .filter((row) => row.departureDate)
      .map((row) => {
        const departureDate = new Date(row.departureDate as any);
        const returnDate = row.returnDate ? new Date(row.returnDate as any) : null;

        const departureDay = departureDate.getDate();
        let dates = `${departureDay}`;

        if (returnDate) {
          const returnDay = returnDate.getDate();
          if (
            departureDate.getFullYear() === returnDate.getFullYear() &&
            departureDate.getMonth() === returnDate.getMonth()
          ) {
            dates = `${departureDay} - ${returnDay}`;
          } else {
            const returnMonth = formatMonthOnly(returnDate);
            const returnYear = returnDate.getFullYear();
            const returnLabel =
              departureDate.getFullYear() === returnYear
                ? returnMonth
                : `${returnMonth} ${returnYear}`;
            dates = `${departureDay} - ${returnDay} ${returnLabel}`;
          }
        }

        return {
          id: row.id,
          slug: row.slug,
          title: row.title,
          month: formatMonthYear(departureDate),
          dates,
          departureDate: departureDate.toISOString(),
          returnDate: returnDate ? returnDate.toISOString() : null,
          totalSeats: row.totalSeats,
          availableSeats: row.availableSeats,
        };
      });
  }

  async findAll(
    filters: {
      status?: string;
      tripType?: string;
      search?: string;
      createdFrom?: string;
      createdTo?: string;
    },
    page?: number,
    limit?: number,
  ) {
    const where: Prisma.OmraPackWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.tripType) where.tripType = filters.tripType;
    if (filters.search) {
      const q = filters.search;
      where.OR = [
        { title: { contains: q } },
        { slug: { contains: q } },
        { hotelSummary: { contains: q } },
      ];
    }
    const bounds = createdAtBounds(filters.createdFrom, filters.createdTo);
    if (bounds) where.createdAt = bounds;
    const orderBy = { updatedAt: 'desc' as const };
    const { page: pg, limit: lim, skip } = normalizePagination(page, limit);
    const [total, data] = await Promise.all([
      this.prisma.omraPack.count({ where }),
      this.prisma.omraPack.findMany({
        where,
        orderBy,
        skip,
        take: lim,
      }),
    ]);
    return { data, meta: listMeta(total, pg, lim) };
  }

  async findOne(id: string) {
    const pack = await this.prisma.omraPack.findUnique({ where: { id } });
    if (!pack) throw new NotFoundException('Omra pack not found');
    return pack;
  }

  create(dto: CreateOmraPackDto) {
    return this.prisma.omraPack.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        tripType: dto.tripType,
        description: dto.description,
        shortDescription: dto.shortDescription,
        status: dto.status,
        duration: dto.duration,
        departureCity: dto.departureCity,
        basePrice: dto.basePrice,
        promoPrice: dto.promoPrice,
        totalSeats: dto.totalSeats,
        availableSeats: dto.availableSeats,
        featured: dto.featured ?? false,
        hotelSummary: dto.hotelSummary,
        hotelRating: dto.hotelRating,
        services: dto.services,
        images: dto.images,
        inclusions: dto.inclusions ?? [],
        exclusions: dto.exclusions ?? [],
        program: toJsonInput(dto.program),
        hotels: toJsonInput(dto.hotels),
        flights: toJsonInput(dto.flights),
        pricingOptions: toJsonInput(dto.pricingOptions),
        departureDate: parseDate(dto.departureDate) ?? undefined,
        returnDate: parseDate(dto.returnDate) ?? undefined,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
    });
  }

  async update(id: string, dto: UpdateOmraPackDto) {
    const existing = await this.findOne(id);
    const {
      departureDate,
      returnDate,
      program,
      hotels,
      flights,
      pricingOptions,
      status,
      ...rest
    } = dto;
    if (status !== undefined && status !== existing.status) {
      assertContentLifecycleTransition(existing.status, status);
    }
    return this.prisma.omraPack.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined && { status }),
        ...(departureDate !== undefined && {
          departureDate: parseDate(departureDate),
        }),
        ...(returnDate !== undefined && { returnDate: parseDate(returnDate) }),
        ...(program !== undefined && { program: toJsonInput(program) }),
        ...(hotels !== undefined && { hotels: toJsonInput(hotels) }),
        ...(flights !== undefined && { flights: toJsonInput(flights) }),
        ...(pricingOptions !== undefined && {
          pricingOptions: toJsonInput(pricingOptions),
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const [reservations, specials] = await Promise.all([
      this.prisma.omraReservation.count({ where: { packId: id } }),
      this.prisma.specialOffer.count({ where: { packId: id } }),
    ]);
    if (reservations > 0 || specials > 0) {
      throw new BadRequestException(
        'Cannot delete pack: linked reservations or special offers exist',
      );
    }
    await this.prisma.omraPack.delete({ where: { id } });
    return { success: true };
  }
}
