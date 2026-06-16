import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dto/category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.productCategory.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.productCategory.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }

  create(dto: CreateProductCategoryDto) {
    return this.prisma.productCategory.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductCategoryDto) {
    await this.findOne(id);
    return this.prisma.productCategory.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.productCategory.delete({ where: { id } });
    return { success: true };
  }
}
