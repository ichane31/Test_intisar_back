import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentAuditService } from './payment-audit.service';

/**
 * Stub notifications — persiste l’historique et journalise.
 * Remplacer par email/SMS (SendGrid, Twilio, etc.) à l’activation.
 */
@Injectable()
export class PaymentNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: PaymentAuditService,
  ) {}

  async notifyOrderPaid(input: {
    orderId: string;
    channel: 'email' | 'sms';
    template: string;
    payload?: Prisma.JsonValue;
  }): Promise<void> {
    await this.prisma.paymentPlatformNotification.create({
      data: {
        orderId: input.orderId,
        channel: input.channel,
        template: input.template,
        payload: input.payload ?? undefined,
        status: 'queued_stub',
      },
    });
    await this.audit.log('info', `notification_stub:${input.template}`, {
      orderId: input.orderId,
      channel: input.channel,
    });
  }
}
