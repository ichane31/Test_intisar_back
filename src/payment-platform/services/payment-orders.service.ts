import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
} from '../constants/payment-status';
import type { CreatePaymentOrderDto } from '../dto/create-order.dto';
import { generatePaymentOrderNumber } from '../utils/order-number';
import { PaymentPricingService } from './payment-pricing.service';

@Injectable()
export class PaymentOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PaymentPricingService,
  ) {}

  async create(dto: CreatePaymentOrderDto, createdByAdminId?: string) {
    const totals = await this.pricing.computeTotals({
      lines: dto.lines,
      promoCode: dto.promoCode,
      payableMode: dto.payableMode,
      depositPercent: dto.depositPercent,
    });

    return this.prisma.paymentPlatformOrder.create({
      data: {
        orderNumber: generatePaymentOrderNumber(),
        status: ORDER_STATUS.PENDING,
        paymentStatus: ORDER_PAYMENT_STATUS.PENDING,
        currency: 'MAD',
        subtotalAmount: totals.subtotalAmount,
        discountAmount: totals.discountAmount,
        promoCode: totals.promoCode,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        paidAmount: 0,
        payableMode: dto.payableMode,
        lines: totals.lines as Prisma.InputJsonValue,
        clientId: dto.clientId ?? null,
        clientEmail: dto.clientEmail,
        clientName: dto.clientName,
        clientPhone: dto.clientPhone ?? null,
        linkedOmraPackId: dto.linkedOmraPackId ?? null,
        createdByAdminId: createdByAdminId ?? null,
      },
    });
  }

  findMany(take = 50) {
    return this.prisma.paymentPlatformOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(take, 200),
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.paymentPlatformOrder.findUnique({
      where: { id },
      include: {
        payments: { orderBy: { createdAt: 'desc' } },
        invoices: true,
        transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!row) throw new NotFoundException('Commande introuvable');
    return row;
  }
}
