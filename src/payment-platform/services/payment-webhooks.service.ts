import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
  PAYMENT_PROVIDER_CODE,
  PAYMENT_RECORD_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../constants/payment-status';
import { PaymentProvidersRegistry } from '../providers/payment-providers.registry';
import { PaymentAuditService } from './payment-audit.service';
import { PaymentInvoicesService } from './payment-invoices.service';
import { PaymentNotificationService } from './payment-notification.service';

@Injectable()
export class PaymentWebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: PaymentProvidersRegistry,
    private readonly audit: PaymentAuditService,
    private readonly invoices: PaymentInvoicesService,
    private readonly notifications: PaymentNotificationService,
  ) {}

  async handle(
    provider: string,
    req: Request,
    headers: Record<string, string | string[] | undefined>,
    parsedBody: unknown,
  ) {
    const code = provider.toLowerCase();
    if (
      code !== PAYMENT_PROVIDER_CODE.STRIPE &&
      code !== PAYMENT_PROVIDER_CODE.PAYPAL &&
      code !== PAYMENT_PROVIDER_CODE.CMI
    ) {
      throw new BadRequestException('Provider webhook inconnu');
    }

    const adapter = this.registry.get(code);
    const rawBody = (req as { rawBody?: Buffer }).rawBody;
    const ok = await adapter.verifyWebhookSignature(headers, rawBody, parsedBody);
    if (!ok) {
      await this.audit.log('warn', 'webhook_signature_invalid', { provider: code });
      throw new BadRequestException('Signature webhook invalide');
    }

    const event = await adapter.handleWebhookEvent(rawBody, parsedBody);
    if (!event) {
      return { received: true, applied: false };
    }

    if (
      !event.providerIntentId &&
      !event.orderIdHint &&
      typeof parsedBody === 'object' &&
      parsedBody
    ) {
      const b = parsedBody as Record<string, unknown>;
      const oid = typeof b.oid === 'string' ? b.oid : undefined;
      if (oid) {
        event.providerIntentId = oid;
      }
    }

    const payment = event.providerIntentId
      ? await this.prisma.paymentPlatformPayment.findFirst({
          where: { providerIntentId: event.providerIntentId },
          include: { order: true },
        })
      : event.orderIdHint
        ? await this.prisma.paymentPlatformPayment.findFirst({
            where: { orderId: event.orderIdHint },
            orderBy: { createdAt: 'desc' },
            include: { order: true },
          })
        : null;

    if (!payment) {
      await this.audit.log('warn', 'webhook_payment_not_found', {
        provider: code,
        event,
      });
      return { received: true, applied: false, reason: 'payment_not_found' };
    }

    const successLike =
      event.type.includes('payment_intent.succeeded') ||
      event.type.includes('CHECKOUT.ORDER.APPROVED') ||
      event.type.includes('PAYMENT.CAPTURE.COMPLETED') ||
      event.type === 'cmi.payment.success';

    if (successLike && payment.status === PAYMENT_RECORD_STATUS.PENDING) {
      await this.prisma.$transaction([
        this.prisma.paymentPlatformPayment.update({
          where: { id: payment.id },
          data: {
            status: PAYMENT_RECORD_STATUS.SUCCESS,
            lastProviderPayload: parsedBody as Prisma.JsonValue,
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
            description: `webhook:${event.type}`,
          },
        }),
      ]);
      const invoice = await this.invoices.issueForOrder(payment.orderId);
      await this.notifications.notifyOrderPaid({
        orderId: payment.orderId,
        channel: 'email',
        template: 'order_paid_webhook_v1',
        payload: { invoiceId: invoice.id },
      });
      await this.audit.log('info', 'webhook_applied_success', {
        paymentId: payment.id,
        type: event.type,
      });
      return { received: true, applied: true, paymentId: payment.id };
    }

    await this.audit.log('info', 'webhook_no_state_change', {
      paymentId: payment.id,
      type: event.type,
      currentStatus: payment.status,
    });
    return { received: true, applied: false };
  }
}
