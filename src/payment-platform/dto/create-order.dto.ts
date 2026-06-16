import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { PAYABLE_MODE } from '../constants/payment-status';

export class CartLineDto {
  @IsIn(['omra_pack', 'shop_product', 'custom'])
  kind!: 'omra_pack' | 'shop_product' | 'custom';

  @IsOptional()
  @IsString()
  refId?: string;

  @IsString()
  title!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreatePaymentOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartLineDto)
  lines!: CartLineDto[];

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsIn([PAYABLE_MODE.FULL, PAYABLE_MODE.DEPOSIT, PAYABLE_MODE.BALANCE])
  payableMode!: (typeof PAYABLE_MODE)[keyof typeof PAYABLE_MODE];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(99)
  depositPercent?: number;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsEmail()
  clientEmail!: string;

  @IsString()
  clientName!: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsString()
  linkedOmraPackId?: string;
}
