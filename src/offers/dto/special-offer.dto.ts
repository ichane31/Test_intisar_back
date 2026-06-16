import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

const contentStatuses = ['draft', 'published', 'archived'] as const;

export class CreateSpecialOfferDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalPrice!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountedPrice!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountPercentage!: number;

  @IsString()
  packId!: string;

  @IsString()
  validFrom!: string;

  @IsString()
  validTo!: string;

  @IsIn(contentStatuses)
  status!: (typeof contentStatuses)[number];
}

export class UpdateSpecialOfferDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  originalPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountedPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountPercentage?: number;

  @IsOptional()
  @IsString()
  packId?: string;

  @IsOptional()
  @IsString()
  validFrom?: string;

  @IsOptional()
  @IsString()
  validTo?: string;

  @IsOptional()
  @IsIn(contentStatuses)
  status?: (typeof contentStatuses)[number];
}
