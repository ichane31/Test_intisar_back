import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../common/public.decorator';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';
import {
  CancelPaymentDto,
  RefundPaymentDto,
} from '../dto/cancel-refund-payment.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentsCoreService } from '../services/payments-core.service';
import { PaymentWebhooksService } from '../services/payment-webhooks.service';

@ApiTags('payment-platform')
@Controller('payments')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsCoreService,
    private readonly webhooks: PaymentWebhooksService,
  ) {}

  @Post('create')
  create(
    @Body() dto: CreatePaymentDto,
    @Headers('idempotency-key') idem?: string,
  ) {
    return this.payments.createPaymentIntent(dto, idem?.trim() || undefined);
  }

  @Post('confirm')
  confirm(
    @Body() dto: ConfirmPaymentDto,
    @Headers('idempotency-key') idem?: string,
  ) {
    return this.payments.confirmPayment(
      dto.paymentId,
      dto.providerPayload,
      idem?.trim() || undefined,
    );
  }

  @Post('cancel')
  cancel(@Body() dto: CancelPaymentDto) {
    return this.payments.cancelPayment(dto.paymentId);
  }

  @Post('refund')
  refund(@Body() dto: RefundPaymentDto) {
    return this.payments.refundPayment(dto.paymentId, dto.amount);
  }

  /**
   * Webhook public: `?provider=stripe|paypal|cmi` + signature provider.
   * Stripe: corps brut + en-tête `stripe-signature` (activer `rawBody` sur l’API).
   */
  @Post('webhook')
  @Public()
  async webhook(
    @Query('provider') provider: string,
    @Req() req: Request,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: unknown,
  ) {
    const p = (provider || '').trim().toLowerCase();
    return this.webhooks.handle(p, req, headers, body);
  }

  @Post('webhook/:provider')
  @Public()
  async webhookPath(
    @Param('provider') provider: string,
    @Req() req: Request,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: unknown,
  ) {
    return this.webhooks.handle(provider, req, headers, body);
  }
}
