import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assertContentLifecycleTransition } from '../common/status-transitions';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateSpecialOfferDto,
  UpdateSpecialOfferDto,
} from './dto/special-offer.dto';

@Injectable()
export class SpecialOffersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.specialOffer.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.specialOffer.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Special offer not found');
    return row;
  }

  async create(dto: CreateSpecialOfferDto) {
    const pack = await this.prisma.omraPack.findUnique({
      where: { id: dto.packId },
    });
    if (!pack) {
      throw new BadRequestException('Referenced omra pack does not exist');
    }
    return this.prisma.specialOffer.create({
      data: {
        title: dto.title,
        description: dto.description,
        originalPrice: dto.originalPrice,
        discountedPrice: dto.discountedPrice,
        discountPercentage: dto.discountPercentage,
        packId: dto.packId,
        validFrom: new Date(dto.validFrom),
        validTo: new Date(dto.validTo),
        status: dto.status,
      },
    });
  }

  async update(id: string, dto: UpdateSpecialOfferDto) {
    const existing = await this.findOne(id);
    if (dto.packId) {
      const pack = await this.prisma.omraPack.findUnique({
        where: { id: dto.packId },
      });
      if (!pack) {
        throw new BadRequestException('Referenced omra pack does not exist');
      }
    }
    const { validFrom, validTo, status, ...rest } = dto;
    if (status !== undefined && status !== existing.status) {
      assertContentLifecycleTransition(existing.status, status);
    }
    return this.prisma.specialOffer.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined && { status }),
        ...(validFrom !== undefined && { validFrom: new Date(validFrom) }),
        ...(validTo !== undefined && { validTo: new Date(validTo) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.specialOffer.delete({ where: { id } });
    return { success: true };
  }
}
