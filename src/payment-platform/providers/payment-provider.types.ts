import type { Prisma } from '@prisma/client';
import type { PaymentProviderCode } from '../constants/payment-status';

export type CreateIntentInput = {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  metadata?: Prisma.JsonValue;
  successUrl?: string;
  cancelUrl?: string;
};

export type CreateIntentResult = {
  providerIntentId: string;
  clientSecret?: string;
  approvalUrl?: string;
  raw?: Prisma.JsonValue;
};

export type ConfirmIntentInput = {
  providerIntentId: string;
  payload?: Prisma.JsonValue;
};

export type RefundInput = {
  providerTxnId: string;
  amount?: number;
  currency: string;
};

export interface PaymentProviderAdapter {
  readonly code: PaymentProviderCode;
  createIntent(input: CreateIntentInput): Promise<CreateIntentResult>;
  confirmIntent(input: ConfirmIntentInput): Promise<{ ok: boolean; providerTxnId?: string }>;
  cancelIntent(providerIntentId: string): Promise<{ ok: boolean }>;
  refund(input: RefundInput): Promise<{ ok: boolean; refundId?: string }>;
  verifyWebhookSignature(
    headers: Record<string, string | string[] | undefined>,
    rawBody: Buffer | undefined,
    parsedBody: unknown,
  ): Promise<boolean>;
  handleWebhookEvent(
    rawBody: Buffer | undefined,
    parsedBody: unknown,
  ): Promise<{
    type: string;
    providerIntentId?: string;
    orderIdHint?: string;
    amount?: number;
    currency?: string;
  } | null>;
}
