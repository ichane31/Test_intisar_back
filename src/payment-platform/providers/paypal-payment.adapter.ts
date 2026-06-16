import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PAYMENT_PROVIDER_CODE } from '../constants/payment-status';
import type {
  ConfirmIntentInput,
  CreateIntentInput,
  CreateIntentResult,
  PaymentProviderAdapter,
  RefundInput,
} from './payment-provider.types';

/**
 * PayPal — stub checkout. Webhook: signature HMAC SHA-256 du corps sur l’en-tête
 * `x-intisar-paypal-signature` (mode lab / intégration progressive).
 * En production: remplacer par la vérification officielle des certificats PayPal.
 */
@Injectable()
export class PaypalPaymentAdapter implements PaymentProviderAdapter {
  readonly code = PAYMENT_PROVIDER_CODE.PAYPAL;
  private readonly logger = new Logger(PaypalPaymentAdapter.name);

  async createIntent(input: CreateIntentInput): Promise<CreateIntentResult> {
    const providerIntentId = `paypal_order_stub_${input.orderId}_${Date.now()}`;
    const approvalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${providerIntentId}`;
    const raw: Prisma.JsonValue = {
      mode: 'stub',
      orderNumber: input.orderNumber,
      amount: input.amount,
      currency: input.currency,
    };
    return { providerIntentId, approvalUrl, raw };
  }

  async confirmIntent(
    input: ConfirmIntentInput,
  ): Promise<{ ok: boolean; providerTxnId?: string }> {
    return {
      ok: true,
      providerTxnId: `paypal_cap_stub_${input.providerIntentId}`,
    };
  }

  async cancelIntent(providerIntentId: string): Promise<{ ok: boolean }> {
    this.logger.debug(`PayPal stub cancel ${providerIntentId}`);
    return { ok: true };
  }

  async refund(input: RefundInput): Promise<{ ok: boolean; refundId?: string }> {
    return { ok: true, refundId: `paypal_refund_${input.providerTxnId}` };
  }

  async verifyWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    rawBody: Buffer | undefined,
    parsedBody: unknown,
  ): Promise<boolean> {
    const secret = process.env.PAYPAL_WEBHOOK_SECRET?.trim();
    if (!secret) {
      this.logger.warn('PAYPAL_WEBHOOK_SECRET manquant — refus webhook');
      return false;
    }
    const body = rawBody?.toString('utf8') ?? JSON.stringify(parsedBody ?? {});
    const expected = createHmac('sha256', secret).update(body).digest('hex');
    const header = firstHeader(headers, 'x-intisar-paypal-signature');
    if (!header) return false;
    try {
      return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  async handleWebhookEvent(
    _rawBody: Buffer | undefined,
    parsedBody: unknown,
  ): Promise<{
    type: string;
    providerIntentId?: string;
    orderIdHint?: string;
    amount?: number;
    currency?: string;
  } | null> {
    if (!parsedBody || typeof parsedBody !== 'object') return null;
    const body = parsedBody as Record<string, unknown>;
    const type = typeof body.event_type === 'string' ? body.event_type : 'unknown';
    const resource = body.resource as Record<string, unknown> | undefined;
    const providerIntentId =
      typeof resource?.id === 'string' ? resource.id : undefined;
    const customId =
      typeof resource?.custom_id === 'string' ? resource.custom_id : undefined;
    return {
      type,
      providerIntentId,
      orderIdHint: customId ?? undefined,
    };
  }
}

function firstHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const v = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(v)) return v[0];
  return typeof v === 'string' ? v : undefined;
}
