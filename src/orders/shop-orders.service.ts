import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  createdAtBounds,
  listMeta,
  normalizePagination,
} from '../common/pagination.util';
import {
  assertOrderStatusTransition,
  assertShopPaymentStatusTransition,
} from '../common/status-transitions';
import { PrismaService } from '../prisma/prisma.service';
import type { ShopOrderListQueryDto } from './dto/shop-order-list-query.dto';
import type { CreateShopOrderDto, UpdateShopOrderDto } from './dto/shop-order.dto';

@Injectable()
export class ShopOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ShopOrderListQueryDto) {
    const where: Prisma.ShopOrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.search) {
      const q = query.search;
      where.OR = [
        { orderNumber: { contains: q } },
        { clientName: { contains: q } },
        { clientEmail: { contains: q } },
      ];
    }
    const bounds = createdAtBounds(query.createdFrom, query.createdTo);
    if (bounds) where.createdAt = bounds;
    const orderBy = { createdAt: 'desc' as const };
    const { page, limit, skip } = normalizePagination(query.page, query.limit);
    const [total, data] = await Promise.all([
      this.prisma.shopOrder.count({ where }),
      this.prisma.shopOrder.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const row = await this.prisma.shopOrder.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Shop order not found');
    return row;
  }

  create(dto: CreateShopOrderDto) {
    return this.prisma.shopOrder.create({
      data: {
        orderNumber: dto.orderNumber,
        clientId: dto.clientId,
        clientName: dto.clientName,
        clientEmail: dto.clientEmail,
        items: dto.items as unknown as Prisma.InputJsonValue,
        totalAmount: dto.totalAmount,
        status: dto.status,
        shippingAddress: dto.shippingAddress,
        paymentMethod: dto.paymentMethod,
        paymentStatus: dto.paymentStatus,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, dto: UpdateShopOrderDto) {
    const existing = await this.findOne(id);
    const { items, status, paymentStatus, ...rest } = dto;
    if (status !== undefined && status !== existing.status) {
      assertOrderStatusTransition(existing.status, status);
    }
    if (
      paymentStatus !== undefined &&
      paymentStatus !== existing.paymentStatus
    ) {
      assertShopPaymentStatusTransition(
        existing.paymentStatus,
        paymentStatus,
      );
    }
    const data: Prisma.ShopOrderUpdateInput = {
      ...rest,
      ...(status !== undefined && { status }),
      ...(paymentStatus !== undefined && { paymentStatus }),
    };
    if (items !== undefined) {
      data.items = items as unknown as Prisma.InputJsonValue;
    }
    return this.prisma.shopOrder.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.shopOrder.delete({ where: { id } });
    return { success: true };
  }
}
