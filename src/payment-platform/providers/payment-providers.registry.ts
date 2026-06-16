import { BadRequestException, Injectable } from '@nestjs/common';
import type { PaymentProviderCode } from '../constants/payment-status';
import { parseAllowedProviders } from '../payment-env';
import { CmiPaymentAdapter } from './cmi-payment.adapter';
import { PaypalPaymentAdapter } from './paypal-payment.adapter';
import { StripePaymentAdapter } from './stripe-payment.adapter';
import type { PaymentProviderAdapter } from './payment-provider.types';

@Injectable()
export class PaymentProvidersRegistry {
  private readonly byCode: Map<PaymentProviderCode, PaymentProviderAdapter>;

  constructor(
    private readonly stripe: StripePaymentAdapter,
    private readonly paypal: PaypalPaymentAdapter,
    private readonly cmi: CmiPaymentAdapter,
  ) {
    const m = new Map<PaymentProviderCode, PaymentProviderAdapter>();
    m.set(stripe.code, stripe);
    m.set(paypal.code, paypal);
    m.set(cmi.code, cmi);
    this.byCode = m;
  }

  get(code: string): PaymentProviderAdapter {
    const allowed = parseAllowedProviders();
    if (!allowed.includes(code as PaymentProviderCode)) {
      throw new BadRequestException(`Provider non autorisé: ${code}`);
    }
    const adapter = this.byCode.get(code as PaymentProviderCode);
    if (!adapter) {
      throw new BadRequestException(`Provider inconnu: ${code}`);
    }
    return adapter;
  }
}
