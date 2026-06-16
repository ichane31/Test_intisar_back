import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const libStatuses = ['draft', 'active', 'archived'] as const;
const libCategories = [
  'contract_template',
  'policy',
  'guide',
  'invoice_template',
  'marketing',
  'other',
] as const;

export class CreateLibraryDocumentDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsIn(libCategories)
  category!: (typeof libCategories)[number];

  @IsString()
  fileName!: string;

  @IsString()
  url!: string;

  @IsString()
  mimeType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  fileSize!: number;

  @IsString()
  version!: string;

  @IsIn(libStatuses)
  status!: (typeof libStatuses)[number];

  @IsString()
  uploadedBy!: string;
}

export class UpdateLibraryDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string | null;

  @IsOptional()
  @IsIn(libCategories)
  category?: (typeof libCategories)[number];

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fileSize?: number;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsIn(libStatuses)
  status?: (typeof libStatuses)[number];

  @IsOptional()
  @IsString()
  uploadedBy?: string;
}
