import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateFaqDto, UpdateFaqDto } from './dto/faqs.dto';

@Injectable()
export class FaqsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.faq.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.faq.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('FAQ not found');
    return row;
  }

  create(dto: CreateFaqDto) {
    return this.prisma.faq.create({ data: dto });
  }

  async update(id: string, dto: UpdateFaqDto) {
    await this.findOne(id);
    return this.prisma.faq.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.faq.delete({ where: { id } });
    return { success: true };
  }
}
