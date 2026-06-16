import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSectionDto, UpdateSectionDto } from './dto/sections.dto';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.section.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.section.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Section not found');
    return row;
  }

  create(dto: CreateSectionDto) {
    return this.prisma.section.create({ data: dto });
  }

  async update(id: string, dto: UpdateSectionDto) {
    await this.findOne(id);
    return this.prisma.section.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.section.delete({ where: { id } });
    return { success: true };
  }
}
