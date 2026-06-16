import { IsObject, IsOptional, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  paymentId!: string;

  @IsOptional()
  @IsObject()
  providerPayload?: Record<string, unknown>;
}
