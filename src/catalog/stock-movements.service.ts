import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateStockMovementDto } from './dto/stock.dto';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.stockMovement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateStockMovementDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    let delta = dto.quantity;
    if (dto.type === 'in') delta = Math.abs(dto.quantity);
    else if (dto.type === 'out') delta = -Math.abs(dto.quantity);

    const newStock = Math.max(0, product.stock + delta);

    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: dto.productId },
        data: { stock: newStock },
      });
      return tx.stockMovement.create({
        data: {
          productId: dto.productId,
          productName: dto.productName,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason,
          createdBy: dto.createdBy,
        },
      });
    });
  }
}
