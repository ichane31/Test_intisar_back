import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateGuideDto, UpdateGuideDto } from './dto/guides.dto';

@Injectable()
export class GuidesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.guide.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.guide.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Guide not found');
    return row;
  }

  create(dto: CreateGuideDto) {
    return this.prisma.guide.create({ data: dto });
  }

  async update(id: string, dto: UpdateGuideDto) {
    await this.findOne(id);
    return this.prisma.guide.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.guide.delete({ where: { id } });
    return { success: true };
  }
}
