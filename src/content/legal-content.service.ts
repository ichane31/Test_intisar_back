import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateLegalContentDto, UpdateLegalContentDto } from './dto/legal.dto';

@Injectable()
export class LegalContentService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.legalContent.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.legalContent.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Legal content not found');
    return row;
  }

  create(dto: CreateLegalContentDto) {
    return this.prisma.legalContent.create({ data: dto });
  }

  async update(id: string, dto: UpdateLegalContentDto) {
    await this.findOne(id);
    return this.prisma.legalContent.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.legalContent.delete({ where: { id } });
    return { success: true };
  }
}
