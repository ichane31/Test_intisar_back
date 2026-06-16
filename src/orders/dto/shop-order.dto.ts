import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

const orderStatuses = ['pending', 'confirmed', 'cancelled', 'refunded'] as const;
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'] as const;

export class OrderItemDto {
  @IsString()
  productId!: string;

  @IsString()
  productName!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalPrice!: number;
}

export class CreateShopOrderDto {
  @IsString()
  orderNumber!: string;

  @IsString()
  clientId!: string;

  @IsString()
  clientName!: string;

  @IsString()
  clientEmail!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsIn(orderStatuses)
  status!: (typeof orderStatuses)[number];

  @IsString()
  shippingAddress!: string;

  @IsString()
  paymentMethod!: string;

  @IsIn(paymentStatuses)
  paymentStatus!: (typeof paymentStatuses)[number];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateShopOrderDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  clientEmail?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsIn(orderStatuses)
  status?: (typeof orderStatuses)[number];

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsIn(paymentStatuses)
  paymentStatus?: (typeof paymentStatuses)[number];

  @IsOptional()
  @IsString()
  notes?: string | null;
}
