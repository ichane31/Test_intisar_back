import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ORDER_PAYMENT_STATUS } from '../constants/payment-status';
import { generateInvoiceNumber } from '../utils/order-number';
import { buildInvoicePdfBuffer } from '../utils/invoice-pdf.util';
import { PaymentAuditService } from './payment-audit.service';

@Injectable()
export class PaymentInvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: PaymentAuditService,
  ) {}

  async issueForOrder(orderId: string) {
    const order = await this.prisma.paymentPlatformOrder.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Commande introuvable');

    const existing = await this.prisma.paymentPlatformInvoice.findFirst({
      where: { orderId, status: { not: 'void' } },
    });
    if (existing) return existing;

    const invoice = await this.prisma.paymentPlatformInvoice.create({
      data: {
        orderId,
        invoiceNumber: generateInvoiceNumber(),
        status: 'issued',
        currency: order.currency,
        totalAmount: order.totalAmount,
        issuedAt: new Date(),
      },
    });
    await this.audit.log('info', 'invoice_issued', {
      invoiceId: invoice.id,
      orderId,
      invoiceNumber: invoice.invoiceNumber,
    });
    return invoice;
  }

  async findOne(id: string) {
    const row = await this.prisma.paymentPlatformInvoice.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!row) throw new NotFoundException('Facture introuvable');
    return row;
  }

  async findByOrder(orderId: string) {
    return this.prisma.paymentPlatformInvoice.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPdfBuffer(invoiceId: string): Promise<Uint8Array> {
    const inv = await this.prisma.paymentPlatformInvoice.findUnique({
      where: { id: invoiceId },
      include: { order: true },
    });
    if (!inv) throw new NotFoundException('Facture introuvable');

    const lines = inv.order.lines;
    const linesSummary =
      typeof lines === 'string'
        ? lines
        : JSON.stringify(lines ?? [], null, 0).slice(0, 2000);

    return buildInvoicePdfBuffer({
      invoiceNumber: inv.invoiceNumber,
      orderNumber: inv.order.orderNumber,
      clientName: inv.order.clientName ?? '—',
      clientEmail: inv.order.clientEmail ?? '—',
      currency: inv.currency,
      totalAmount: inv.totalAmount,
      paymentStatus: inv.order.paymentStatus ?? ORDER_PAYMENT_STATUS.PENDING,
      linesSummary,
      issuedAt: inv.issuedAt ?? inv.createdAt,
    });
  }
}
