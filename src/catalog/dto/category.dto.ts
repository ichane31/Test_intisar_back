import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const contentStatuses = ['draft', 'published', 'archived'] as const;

export class CreateProductCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @Type(() => Number)
  @IsInt()
  order!: number;

  @IsIn(contentStatuses)
  status!: (typeof contentStatuses)[number];
}

export class UpdateProductCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  parentId?: string | null;

  @IsOptional()
  @IsString()
  image?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @IsOptional()
  @IsIn(contentStatuses)
  status?: (typeof contentStatuses)[number];
}
