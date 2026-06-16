import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePageDto, UpdatePageDto } from './dto/pages.dto';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.page.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.page.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Page not found');
    return row;
  }

  create(dto: CreatePageDto) {
    return this.prisma.page.create({ data: dto });
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findOne(id);
    return this.prisma.page.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.page.delete({ where: { id } });
    return { success: true };
  }
}
