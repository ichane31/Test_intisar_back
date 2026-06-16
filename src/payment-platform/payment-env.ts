import { PAYMENT_PROVIDER_CODE, type PaymentProviderCode } from './constants/payment-status';

export function isPaymentPlatformEnabled(): boolean {
  return process.env.PAYMENT_PLATFORM_ENABLED === 'true';
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined;
}

export function getPaypalWebhookId(): string | undefined {
  return process.env.PAYPAL_WEBHOOK_ID?.trim() || undefined;
}

export function getCmiMerchantKey(): string | undefined {
  return process.env.CMI_MERCHANT_KEY?.trim() || undefined;
}

export function parseAllowedProviders(): PaymentProviderCode[] {
  const raw = process.env.PAYMENT_ALLOWED_PROVIDERS?.trim();
  if (!raw) {
    return [
      PAYMENT_PROVIDER_CODE.STRIPE,
      PAYMENT_PROVIDER_CODE.PAYPAL,
      PAYMENT_PROVIDER_CODE.CMI,
    ];
  }
  const parts = raw.split(',').map((p) => p.trim().toLowerCase());
  const out: PaymentProviderCode[] = [];
  for (const p of parts) {
    if (
      p === PAYMENT_PROVIDER_CODE.STRIPE ||
      p === PAYMENT_PROVIDER_CODE.PAYPAL ||
      p === PAYMENT_PROVIDER_CODE.CMI
    ) {
      out.push(p);
    }
  }
  return out.length ? out : [PAYMENT_PROVIDER_CODE.STRIPE];
}
