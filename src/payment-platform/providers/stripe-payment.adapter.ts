import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PAYMENT_PROVIDER_CODE } from '../constants/payment-status';
import { getStripeWebhookSecret } from '../payment-env';
import type {
  ConfirmIntentInput,
  CreateIntentInput,
  CreateIntentResult,
  PaymentProviderAdapter,
  RefundInput,
} from './payment-provider.types';

/**
 * Adaptateur Stripe — intents simulés tant que @stripe/stripe-node n’est pas branché.
 * À l’activation prod: remplacer createIntent/confirm par les appels API Stripe.
 */
@Injectable()
export class StripePaymentAdapter implements PaymentProviderAdapter {
  readonly code = PAYMENT_PROVIDER_CODE.STRIPE;
  private readonly logger = new Logger(StripePaymentAdapter.name);

  async createIntent(input: CreateIntentInput): Promise<CreateIntentResult> {
    const providerIntentId = `pi_stub_${input.orderId}_${Date.now()}`;
    const clientSecret = `${providerIntentId}_secret_stub`;
    const raw: Prisma.JsonValue = {
      mode: 'stub',
      orderNumber: input.orderNumber,
      amount: input.amount,
      currency: input.currency,
    };
    return { providerIntentId, clientSecret, raw };
  }

  async confirmIntent(
    input: ConfirmIntentInput,
  ): Promise<{ ok: boolean; providerTxnId?: string }> {
    return {
      ok: true,
      providerTxnId: `ch_stub_${input.providerIntentId}`,
    };
  }

  async cancelIntent(providerIntentId: string): Promise<{ ok: boolean }> {
    this.logger.debug(`Stripe stub cancel ${providerIntentId}`);
    return { ok: true };
  }

  async refund(input: RefundInput): Promise<{ ok: boolean; refundId?: string }> {
    return { ok: true, refundId: `re_stub_${input.providerTxnId}` };
  }

  async verifyWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    rawBody: Buffer | undefined,
  ): Promise<boolean> {
    const secret = getStripeWebhookSecret();
    if (!secret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET manquant — refus webhook');
      return false;
    }
    const sig = headers['stripe-signature'];
    const sigStr = Array.isArray(sig) ? sig[0] : sig;
    if (!sigStr || !rawBody) {
      return false;
    }
    const parts = sigStr.split(',').map((p) => p.trim());
    const t = parts.find((p) => p.startsWith('t='))?.slice(2);
    const v1 = parts.find((p) => p.startsWith('v1='))?.slice(3);
    if (!t || !v1) {
      return false;
    }
    const signedPayload = `${t}.${rawBody.toString('utf8')}`;
    const key = secret.startsWith('whsec_')
      ? Buffer.from(secret.slice(6), 'base64')
      : secret;
    const expected = createHmac('sha256', key)
      .update(signedPayload, 'utf8')
      .digest('hex');
    try {
      return timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
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
    const type = typeof body.type === 'string' ? body.type : 'unknown';
    const data = body.data as Record<string, unknown> | undefined;
    const obj = data?.object as Record<string, unknown> | undefined;
    const providerIntentId =
      typeof obj?.id === 'string' ? obj.id : undefined;
    const metadata = obj?.metadata as Record<string, unknown> | undefined;
    const orderIdHint =
      typeof metadata?.payment_platform_order_id === 'string'
        ? metadata.payment_platform_order_id
        : undefined;
    const amount =
      typeof obj?.amount === 'number' ? obj.amount / 100 : undefined;
    const currency =
      typeof obj?.currency === 'string' ? obj.currency : undefined;
    return { type, providerIntentId, orderIdHint, amount, currency };
  }
}
