import { DynamicModule, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentInvoicesController } from './controllers/payment-invoices.controller';
import { PaymentOrdersController } from './controllers/payment-orders.controller';
import { PaymentsController } from './controllers/payments.controller';
import { isPaymentPlatformEnabled } from './payment-env';
import { CmiPaymentAdapter } from './providers/cmi-payment.adapter';
import { PaypalPaymentAdapter } from './providers/paypal-payment.adapter';
import { PaymentProvidersRegistry } from './providers/payment-providers.registry';
import { StripePaymentAdapter } from './providers/stripe-payment.adapter';
import { PaymentAuditService } from './services/payment-audit.service';
import { PaymentCheckoutService } from './services/payment-checkout.service';
import { PaymentIdempotencyService } from './services/payment-idempotency.service';
import { PaymentInvoicesService } from './services/payment-invoices.service';
import { PaymentNotificationService } from './services/payment-notification.service';
import { PaymentOrdersService } from './services/payment-orders.service';
import { PaymentPricingService } from './services/payment-pricing.service';
import { PaymentWebhooksService } from './services/payment-webhooks.service';
import { PaymentsCoreService } from './services/payments-core.service';

const PAYMENT_CONTROLLERS = [
  PaymentsController,
  PaymentOrdersController,
  PaymentInvoicesController,
];

const PAYMENT_PROVIDERS = [
  StripePaymentAdapter,
  PaypalPaymentAdapter,
  CmiPaymentAdapter,
  PaymentProvidersRegistry,
  PaymentAuditService,
  PaymentPricingService,
  PaymentOrdersService,
  PaymentCheckoutService,
  PaymentIdempotencyService,
  PaymentNotificationService,
  PaymentInvoicesService,
  PaymentWebhooksService,
  PaymentsCoreService,
];

@Module({})
export class PaymentPlatformModule {
  static register(): DynamicModule {
    const enabled = isPaymentPlatformEnabled();
    return {
      module: PaymentPlatformModule,
      imports: [PrismaModule],
      controllers: enabled ? PAYMENT_CONTROLLERS : [],
      providers: enabled ? PAYMENT_PROVIDERS : [],
    };
  }
}
