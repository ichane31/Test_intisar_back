import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CancelPaymentDto {
  @IsString()
  paymentId!: string;
}

export class RefundPaymentDto {
  @IsString()
  paymentId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
