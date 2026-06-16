import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSystemLogDto } from './dto/system-log.dto';

@Injectable()
export class SystemLogsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.systemLog.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.systemLog.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Log not found');
    return row;
  }

  create(dto: CreateSystemLogDto) {
    return this.prisma.systemLog.create({
      data: {
        level: dto.level,
        message: dto.message,
        source: dto.source,
        details:
          dto.details === undefined
            ? undefined
            : (dto.details as Prisma.InputJsonValue),
      },
    });
  }
}
