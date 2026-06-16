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
import {
  assertOmraPaymentStatusTransition,
  assertOrderStatusTransition,
} from '../common/status-transitions';
import { PrismaService } from '../prisma/prisma.service';
import type { OmraReservationListQueryDto } from './dto/omra-reservation-list-query.dto';
import type {
  CreateOmraReservationDto,
  UpdateOmraReservationDto,
} from './dto/omra-reservation.dto';

@Injectable()
export class OmraReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: OmraReservationListQueryDto) {
    const where: Prisma.OmraReservationWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.search) {
      const q = query.search;
      where.OR = [
        { reservationNumber: { contains: q } },
        { clientName: { contains: q } },
        { packTitle: { contains: q } },
      ];
    }
    const bounds = createdAtBounds(query.createdFrom, query.createdTo);
    if (bounds) where.createdAt = bounds;
    const orderBy = { createdAt: 'desc' as const };
    const { page, limit, skip } = normalizePagination(query.page, query.limit);
    const [total, data] = await Promise.all([
      this.prisma.omraReservation.count({ where }),
      this.prisma.omraReservation.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const row = await this.prisma.omraReservation.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Reservation not found');
    return row;
  }

  async create(dto: CreateOmraReservationDto) {
    const { departureDate, referralCodeUsed, ...rest } = dto;
    let referralDiscountMAD = dto.referralDiscountMAD ?? 0;
    let parrainId: string | null = null;
    let parrainCode: string | null = null;
    if (referralCodeUsed?.trim()) {
      const code = referralCodeUsed.trim().toUpperCase();
      const parrain = await this.prisma.client.findFirst({
        where: { referralCode: code },
      });
      if (!parrain) {
        throw new BadRequestException('Code parrainage invalide');
      }
      referralDiscountMAD = Math.min(1000, 500);
      parrainId = parrain.id;
      parrainCode = code;
    }
    const totalAmount = Math.max(0, rest.totalAmount - referralDiscountMAD);
    const row = await this.prisma.omraReservation.create({
      data: {
        ...rest,
        totalAmount,
        departureDate: new Date(departureDate),
        referralCodeUsed: referralCodeUsed?.trim().toUpperCase() ?? undefined,
        referralDiscountMAD,
      },
    });
    if (parrainId && parrainCode) {
      await this.prisma.referral.create({
        data: {
          parrainId,
          parrainCode,
          filleulNom: rest.clientName,
          filleulEmail: rest.clientEmail,
          filleulTel: rest.clientPhone,
          reservationId: row.id,
          statut: 'valide',
          dateValidation: new Date(),
          reductionMAD: referralDiscountMAD,
        },
      });
    }
    return row;
  }

  async update(id: string, dto: UpdateOmraReservationDto) {
    const existing = await this.findOne(id);
    const { departureDate, status, paymentStatus, ...rest } = dto;
    if (status !== undefined && status !== existing.status) {
      assertOrderStatusTransition(existing.status, status);
    }
    if (
      paymentStatus !== undefined &&
      paymentStatus !== existing.paymentStatus
    ) {
      assertOmraPaymentStatusTransition(
        existing.paymentStatus,
        paymentStatus,
      );
    }
    const updated = await this.prisma.omraReservation.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined && { status }),
        ...(paymentStatus !== undefined && { paymentStatus }),
        ...(departureDate !== undefined && {
          departureDate: new Date(departureDate),
        }),
      },
    });
    if (paymentStatus === 'paid' && existing.paymentStatus !== 'paid') {
      await this.prisma.referral.updateMany({
        where: { reservationId: id },
        data: { statut: 'recompense' },
      });
    }
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.omraReservation.delete({ where: { id } });
    return { success: true };
  }
}
