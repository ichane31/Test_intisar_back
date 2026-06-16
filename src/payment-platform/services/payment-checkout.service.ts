import { Injectable } from '@nestjs/common';
import type { CreatePaymentOrderDto } from '../dto/create-order.dto';
import type { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentOrdersService } from './payment-orders.service';
import { PaymentsCoreService } from './payments-core.service';

/**
 * Orchestration checkout: création commande + intent paiement (optionnel même requête future).
 */
@Injectable()
export class PaymentCheckoutService {
  constructor(
    private readonly orders: PaymentOrdersService,
    private readonly payments: PaymentsCoreService,
  ) {}

  async createOrderOnly(
    dto: CreatePaymentOrderDto,
    adminId?: string,
  ) {
    return this.orders.create(dto, adminId);
  }

  async createOrderAndIntent(
    orderDto: CreatePaymentOrderDto,
    paymentDto: Pick<CreatePaymentDto, 'provider' | 'amount' | 'successUrl' | 'cancelUrl'>,
    adminId?: string,
    idempotencyKey?: string,
  ) {
    const order = await this.orders.create(orderDto, adminId);
    const pay = await this.payments.createPaymentIntent(
      {
        orderId: order.id,
        provider: paymentDto.provider,
        amount: paymentDto.amount,
        successUrl: paymentDto.successUrl,
        cancelUrl: paymentDto.cancelUrl,
      },
      idempotencyKey,
    );
    return { order, payment: pay };
  }
}
