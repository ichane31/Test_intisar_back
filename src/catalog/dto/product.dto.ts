import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const contentStatuses = ['draft', 'published', 'archived'] as const;

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxStock?: number;

  @IsString()
  categoryId!: string;

  @IsString()
  categoryName!: string;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsIn(contentStatuses)
  status!: (typeof contentStatuses)[number];

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minStock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxStock?: number | null;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsIn(contentStatuses)
  status?: (typeof contentStatuses)[number];

  @IsOptional()
  @IsString()
  sku?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number | null;
}
