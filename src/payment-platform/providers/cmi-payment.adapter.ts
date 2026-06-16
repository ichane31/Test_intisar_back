import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PAYMENT_PROVIDER_CODE } from '../constants/payment-status';
import { getCmiMerchantKey } from '../payment-env';
import type {
  ConfirmIntentInput,
  CreateIntentInput,
  CreateIntentResult,
  PaymentProviderAdapter,
  RefundInput,
} from './payment-provider.types';

/**
 * CMI / Payzone (Maroc) — stub redirection type POST vers plateforme.
 * En prod: construire les champs HASH selon la doc CMI et valider le retour OK/KO.
 */
@Injectable()
export class CmiPaymentAdapter implements PaymentProviderAdapter {
  readonly code = PAYMENT_PROVIDER_CODE.CMI;
  private readonly logger = new Logger(CmiPaymentAdapter.name);

  async createIntent(input: CreateIntentInput): Promise<CreateIntentResult> {
    const providerIntentId = `cmi_stub_${input.orderId}_${Date.now()}`;
    const approvalUrl = `https://payment.cmi.co.ma/stub?oid=${encodeURIComponent(providerIntentId)}`;
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
      providerTxnId: `cmi_auth_stub_${input.providerIntentId}`,
    };
  }

  async cancelIntent(providerIntentId: string): Promise<{ ok: boolean }> {
    this.logger.debug(`CMI stub cancel ${providerIntentId}`);
    return { ok: true };
  }

  async refund(input: RefundInput): Promise<{ ok: boolean; refundId?: string }> {
    return { ok: true, refundId: `cmi_refund_${input.providerTxnId}` };
  }

  /**
   * Webhook / callback: HMAC SHA256 du corps JSON avec CMI_MERCHANT_KEY,
   * comparé à l’en-tête `x-cmi-signature` (convention INTISAR pour le lab).
   */
  async verifyWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    rawBody: Buffer | undefined,
    parsedBody: unknown,
  ): Promise<boolean> {
    const key = getCmiMerchantKey();
    if (!key) {
      this.logger.warn('CMI_MERCHANT_KEY manquant — refus webhook');
      return false;
    }
    const body = rawBody?.toString('utf8') ?? JSON.stringify(parsedBody ?? {});
    const expected = createHmac('sha256', key).update(body).digest('hex');
    const header = firstHeader(headers, 'x-cmi-signature');
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
    const procReturnCode = body.ProcReturnCode;
    const type =
      procReturnCode === '00' ? 'cmi.payment.success' : 'cmi.payment.failed';
    const oid = typeof body.oid === 'string' ? body.oid : undefined;
    const amount =
      typeof body.amount === 'string'
        ? Number.parseFloat(body.amount)
        : typeof body.amount === 'number'
          ? body.amount
          : undefined;
    return {
      type,
      providerIntentId: oid,
      orderIdHint:
        typeof body.orderId === 'string' ? body.orderId : undefined,
      amount,
      currency: typeof body.currency === 'string' ? body.currency : undefined,
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
