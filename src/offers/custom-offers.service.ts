import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assertCustomOfferStatusTransition } from '../common/status-transitions';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateCustomOfferDto,
  UpdateCustomOfferDto,
} from './dto/custom-offer.dto';

@Injectable()
export class CustomOffersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.customOffer.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.customOffer.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Custom offer not found');
    return row;
  }

  create(dto: CreateCustomOfferDto) {
    const initial = dto.status ?? 'pending';
    if (initial !== 'pending') {
      throw new BadRequestException(
        'New custom offers must be created with status pending',
      );
    }
    return this.prisma.customOffer.create({
      data: {
        clientId: dto.clientId,
        clientName: dto.clientName,
        requirements: dto.requirements,
        proposedPrice: dto.proposedPrice,
        status: 'pending',
        notes: dto.notes,
      },
    });
  }

  async update(id: string, dto: UpdateCustomOfferDto) {
    const existing = await this.findOne(id);
    const { status, ...rest } = dto;
    if (status !== undefined && status !== existing.status) {
      assertCustomOfferStatusTransition(existing.status, status);
    }
    return this.prisma.customOffer.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined && { status }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.customOffer.delete({ where: { id } });
    return { success: true };
  }
}
