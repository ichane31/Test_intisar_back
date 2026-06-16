import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const orderStatuses = ['pending', 'confirmed', 'cancelled', 'refunded'] as const;
const paymentStatuses = ['pending', 'partial', 'paid', 'refunded'] as const;

export class CreateOmraReservationDto {
  @IsString()
  reservationNumber!: string;

  @IsString()
  clientId!: string;

  @IsString()
  clientName!: string;

  @IsString()
  clientEmail!: string;

  @IsString()
  clientPhone!: string;

  @IsString()
  packId!: string;

  @IsString()
  packTitle!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  numberOfPeople!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsIn(orderStatuses)
  status!: (typeof orderStatuses)[number];

  @IsIn(paymentStatuses)
  paymentStatus!: (typeof paymentStatuses)[number];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paidAmount!: number;

  @IsString()
  departureDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  referralCodeUsed?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  referralDiscountMAD?: number;
}

export class UpdateOmraReservationDto {
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
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsString()
  packId?: string;

  @IsOptional()
  @IsString()
  packTitle?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  numberOfPeople?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsIn(orderStatuses)
  status?: (typeof orderStatuses)[number];

  @IsOptional()
  @IsIn(paymentStatuses)
  paymentStatus?: (typeof paymentStatuses)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  paidAmount?: number;

  @IsOptional()
  @IsString()
  departureDate?: string;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  referralCodeUsed?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  referralDiscountMAD?: number;
}
