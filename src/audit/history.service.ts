import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateHistoryEntryDto } from './dto/history.dto';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.historyEntry.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.historyEntry.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('History entry not found');
    return row;
  }

  create(dto: CreateHistoryEntryDto) {
    return this.prisma.historyEntry.create({ data: dto });
  }
}
