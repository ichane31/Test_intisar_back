import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  createdAtBounds,
  listMeta,
  normalizePagination,
} from '../common/pagination.util';
import { assertContentLifecycleTransition } from '../common/status-transitions';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import type { ProductListQueryDto } from './dto/product-list-query.dto';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

function computeStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= minStock) return 'low_stock';
  return 'in_stock';
}

function withStockStatus<
  T extends { stock: number; minStock: number },
>(p: T): T & { stockStatus: StockStatus } {
  return { ...p, stockStatus: computeStockStatus(p.stock, p.minStock) };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductListQueryDto) {
    const where: Prisma.ProductWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) {
      const q = query.search;
      where.OR = [
        { name: { contains: q } },
        { slug: { contains: q } },
        { sku: { contains: q } },
      ];
    }
    const bounds = createdAtBounds(query.createdFrom, query.createdTo);
    if (bounds) where.createdAt = bounds;
    const orderBy = { updatedAt: 'desc' as const };
    const { page, limit, skip } = normalizePagination(query.page, query.limit);
    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({ where, orderBy, skip, take: limit }),
    ]);
    const data = rows.map((r) => withStockStatus(r));
    return { data, meta: listMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const row = await this.prisma.product.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Product not found');
    return withStockStatus(row);
  }

  async create(dto: CreateProductDto) {
    const row = await this.prisma.product.create({
      data: {
        ...dto,
        minStock: dto.minStock ?? 0,
      },
    });
    return withStockStatus(row);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');
    const { status, ...rest } = dto;
    if (status !== undefined && status !== existing.status) {
      assertContentLifecycleTransition(existing.status, status);
    }
    const row = await this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined && { status }),
      },
    });
    return withStockStatus(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }
}
