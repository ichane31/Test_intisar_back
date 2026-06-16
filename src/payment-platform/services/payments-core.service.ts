import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
  PAYMENT_RECORD_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../constants/payment-status';
import type { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentProvidersRegistry } from '../providers/payment-providers.registry';
import { PaymentAuditService } from './payment-audit.service';
import { PaymentIdempotencyService } from './payment-idempotency.service';
import { PaymentInvoicesService } from './payment-invoices.service';
import { PaymentNotificationService } from './payment-notification.service';

@Injectable()
export class PaymentsCoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: PaymentProvidersRegistry,
    private readonly audit: PaymentAuditService,
    private readonly idempotency: PaymentIdempotencyService,
    private readonly invoices: PaymentInvoicesService,
    private readonly notifications: PaymentNotificationService,
  ) {}

  async createPaymentIntent(
    dto: CreatePaymentDto,
    idempotencyKey?: string,
  ) {
    const scope = 'create_payment';
    const payloadHash = this.idempotency.hashPayload(dto);
    if (idempotencyKey) {
      const cached = await this.idempotency.getCached(
        idempotencyKey,
        scope,
        payloadHash,
      );
      if (cached) {
        return cached.body as Record<string, unknown>;
      }
    }

    const order = await this.prisma.paymentPlatformOrder.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new BadRequestException('Commande annulée');
    }

    const amount = dto.amount ?? order.totalAmount;
    if (amount <= 0) {
      throw new BadRequestException('Montant invalide');
    }

    const adapter = this.registry.get(dto.provider);
    const intent = await adapter.createIntent({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount,
      currency: order.currency,
      metadata: {
        payment_platform_order_id: order.id,
      } as Prisma.JsonValue,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
    });

    const payment = await this.prisma.paymentPlatformPayment.create({
      data: {
        orderId: order.id,
        provider: adapter.code,
        status: PAYMENT_RECORD_STATUS.PENDING,
        amount,
        currency: order.currency,
        providerIntentId: intent.providerIntentId,
        clientSecret: intent.clientSecret ?? null,
        providerCheckoutId: intent.approvalUrl ?? null,
        lastProviderPayload: intent.raw ?? undefined,
        idempotencyKey: idempotencyKey ?? null,
      },
    });

    await this.prisma.paymentPlatformTransaction.create({
      data: {
        orderId: order.id,
        paymentId: payment.id,
        type: TRANSACTION_TYPE.AUTH,
        status: TRANSACTION_STATUS.PENDING,
        amount,
        currency: order.currency,
        provider: adapter.code,
        description: 'create_intent',
      },
    });

    await this.audit.log('info', 'payment_intent_created', {
      orderId: order.id,
      paymentId: payment.id,
      provider: adapter.code,
    });

    const body = {
      paymentId: payment.id,
      orderId: order.id,
      provider: adapter.code,
      providerIntentId: intent.providerIntentId,
      clientSecret: intent.clientSecret ?? null,
      approvalUrl: intent.approvalUrl ?? null,
      amount,
      currency: order.currency,
    };

    if (idempotencyKey) {
      await this.idempotency.save(
        idempotencyKey,
        scope,
        payloadHash,
        201,
        body as Prisma.JsonValue,
      );
    }

    return body;
  }

  async confirmPayment(
    paymentId: string,
    providerPayload?: Record<string, unknown>,
    idempotencyKey?: string,
  ) {
    const dto = { paymentId, providerPayload };
    const scope = 'confirm_payment';
    const payloadHash = this.idempotency.hashPayload(dto);
    if (idempotencyKey) {
      const cached = await this.idempotency.getCached(
        idempotencyKey,
        scope,
        payloadHash,
      );
      if (cached) {
        return cached.body as Record<string, unknown>;
      }
    }

    const payment = await this.prisma.paymentPlatformPayment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Paiement introuvable');
    if (!payment.providerIntentId) {
      throw new BadRequestException('Intent provider manquant');
    }

    const adapter = this.registry.get(payment.provider);
    const confirmed = await adapter.confirmIntent({
      providerIntentId: payment.providerIntentId,
      payload: providerPayload as Prisma.JsonValue,
    });
    if (!confirmed.ok) {
      throw new BadRequestException('Confirmation provider refusée');
    }

    await this.prisma.$transaction([
      this.prisma.paymentPlatformPayment.update({
        where: { id: payment.id },
        data: {
          status: PAYMENT_RECORD_STATUS.SUCCESS,
          lastProviderPayload: providerPayload as Prisma.JsonValue,
        },
      }),
      this.prisma.paymentPlatformOrder.update({
        where: { id: payment.orderId },
        data: {
          paidAmount: payment.amount,
          paymentStatus: ORDER_PAYMENT_STATUS.SUCCESS,
          status: ORDER_STATUS.CONFIRMED,
        },
      }),
      this.prisma.paymentPlatformTransaction.create({
        data: {
          orderId: payment.orderId,
          paymentId: payment.id,
          type: TRANSACTION_TYPE.CAPTURE,
          status: TRANSACTION_STATUS.SUCCESS,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider,
          providerTxnId: confirmed.providerTxnId ?? null,
          description: 'confirm_payment',
        },
      }),
    ]);

    const invoice = await this.invoices.issueForOrder(payment.orderId);
    await this.notifications.notifyOrderPaid({
      orderId: payment.orderId,
      channel: 'email',
      template: 'order_paid_v1',
      payload: { invoiceId: invoice.id, orderNumber: payment.order.orderNumber },
    });

    await this.audit.log('info', 'payment_confirmed', {
      paymentId: payment.id,
      orderId: payment.orderId,
    });

    const body = {
      paymentId: payment.id,
      orderId: payment.orderId,
      invoiceId: invoice.id,
      status: PAYMENT_RECORD_STATUS.SUCCESS,
    };

    if (idempotencyKey) {
      await this.idempotency.save(
        idempotencyKey,
        scope,
        payloadHash,
        200,
        body as Prisma.JsonValue,
      );
    }

    return body;
  }

  async cancelPayment(paymentId: string) {
    const payment = await this.prisma.paymentPlatformPayment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Paiement introuvable');
    if (payment.status !== PAYMENT_RECORD_STATUS.PENDING) {
      throw new BadRequestException('Seuls les paiements en attente sont annulables');
    }
    const adapter = this.registry.get(payment.provider);
    if (payment.providerIntentId) {
      await adapter.cancelIntent(payment.providerIntentId);
    }
    await this.prisma.$transaction([
      this.prisma.paymentPlatformPayment.update({
        where: { id: payment.id },
        data: { status: PAYMENT_RECORD_STATUS.FAILED },
      }),
      this.prisma.paymentPlatformTransaction.create({
        data: {
          orderId: payment.orderId,
          paymentId: payment.id,
          type: TRANSACTION_TYPE.VOID,
          status: TRANSACTION_STATUS.SUCCESS,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider,
          description: 'cancel_payment',
        },
      }),
    ]);
    await this.audit.log('info', 'payment_cancelled', { paymentId });
    return { paymentId, status: PAYMENT_RECORD_STATUS.FAILED };
  }

  async refundPayment(paymentId: string, amount?: number) {
    const payment = await this.prisma.paymentPlatformPayment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Paiement introuvable');
    if (payment.status !== PAYMENT_RECORD_STATUS.SUCCESS) {
      throw new BadRequestException('Remboursement: paiement non capturé');
    }
    const cap = await this.prisma.paymentPlatformTransaction.findFirst({
      where: {
        paymentId: payment.id,
        type: TRANSACTION_TYPE.CAPTURE,
        status: TRANSACTION_STATUS.SUCCESS,
      },
      orderBy: { createdAt: 'desc' },
    });
    const providerTxnId = cap?.providerTxnId ?? payment.providerIntentId;
    if (!providerTxnId) {
      throw new BadRequestException('Référence transaction provider manquante');
    }

    const refundAmt = amount ?? payment.amount;
    const adapter = this.registry.get(payment.provider);
    const res = await adapter.refund({
      providerTxnId,
      amount: refundAmt,
      currency: payment.currency,
    });
    if (!res.ok) throw new BadRequestException('Remboursement refusé');

    const isPartial = refundAmt + 1e-6 < payment.order.paidAmount;
    const newPaymentStatus = isPartial
      ? ORDER_PAYMENT_STATUS.PARTIAL
      : ORDER_PAYMENT_STATUS.REFUNDED;

    await this.prisma.$transaction([
      this.prisma.paymentPlatformTransaction.create({
        data: {
          orderId: payment.orderId,
          paymentId: payment.id,
          type: TRANSACTION_TYPE.REFUND,
          status: TRANSACTION_STATUS.SUCCESS,
          amount: refundAmt,
          currency: payment.currency,
          provider: payment.provider,
          providerTxnId: res.refundId ?? null,
          description: 'refund_payment',
        },
      }),
      this.prisma.paymentPlatformPayment.update({
        where: { id: payment.id },
        data: {
          status: isPartial
            ? PAYMENT_RECORD_STATUS.PARTIAL
            : PAYMENT_RECORD_STATUS.REFUNDED,
        },
      }),
      this.prisma.paymentPlatformOrder.update({
        where: { id: payment.orderId },
        data: {
          paidAmount: Math.max(0, payment.order.paidAmount - refundAmt),
          paymentStatus: newPaymentStatus,
        },
      }),
    ]);

    await this.audit.log('info', 'payment_refund', {
      paymentId,
      amount: refundAmt,
      partial: isPartial,
    });

    return { paymentId, refundId: res.refundId, partial: isPartial };
  }
}
