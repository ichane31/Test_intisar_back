import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  createdAtBounds,
  listMeta,
  normalizePagination,
} from '../common/pagination.util';
import { assertLeadStatusTransition } from '../common/status-transitions';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import type { LeadListQueryDto } from './dto/lead-list-query.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: LeadListQueryDto) {
    const where: Prisma.LeadWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.source) where.source = query.source;
    if (query.search) {
      const q = query.search;
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
      ];
    }
    const bounds = createdAtBounds(query.createdFrom, query.createdTo);
    if (bounds) where.createdAt = bounds;
    const orderBy = { updatedAt: 'desc' as const };
    const { page, limit, skip } = normalizePagination(query.page, query.limit);
    const [total, data] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({ where, orderBy, skip, take: limit }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const row = await this.prisma.lead.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Lead not found');
    return row;
  }

  create(dto: CreateLeadDto) {
    const { lastContactAt, ...rest } = dto;
    return this.prisma.lead.create({
      data: {
        ...rest,
        lastContactAt: lastContactAt ? new Date(lastContactAt) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateLeadDto) {
    const existing = await this.findOne(id);
    const { lastContactAt, status, ...rest } = dto;
    if (status !== undefined && status !== existing.status) {
      assertLeadStatusTransition(existing.status, status);
    }
    return this.prisma.lead.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined && { status }),
        ...(lastContactAt !== undefined && {
          lastContactAt: lastContactAt ? new Date(lastContactAt) : null,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lead.delete({ where: { id } });
    return { success: true };
  }
}
