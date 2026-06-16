import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const contentStatuses = ['draft', 'published', 'archived'] as const;
const tripTypes = ['omra', 'hajj', 'combine'] as const;

export class IncludesSummary {
  @IsString()
  flights!: string;

  @IsString()
  hotels!: string;

  @IsString()
  group!: string;

  @IsString()
  schedule!: string;
}

export class CreateOmraPackDto {
  @IsString()
  slug!: string;

  @IsString()
  title!: string;

  @IsIn(tripTypes)
  tripType!: (typeof tripTypes)[number];

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsIn(contentStatuses)
  status!: (typeof contentStatuses)[number];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration!: number;

  @IsOptional()
  @IsString()
  departureCity?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  promoPrice?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalSeats!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  availableSeats!: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsString()
  hotelSummary!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hotelRating!: number;

  @IsArray()
  @IsString({ each: true })
  services!: string[];

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inclusions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @IsOptional()
  // @ValidateNested()
  @Type(() => IncludesSummary)
  includesSummary?: IncludesSummary;

  @IsOptional()
  program?: unknown;

  @IsOptional()
  hotels?: unknown;

  @IsOptional()
  flights?: unknown;

  @IsOptional()
  pricingOptions?: unknown;

  @IsOptional()
  @IsString()
  departureDate?: string;

  @IsOptional()
  @IsString()
  returnDate?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;
}

export class UpdateOmraPackDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsIn(tripTypes)
  tripType?: (typeof tripTypes)[number];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string | null;

  @IsOptional()
  @IsIn(contentStatuses)
  status?: (typeof contentStatuses)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsString()
  departureCity?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  promoPrice?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  totalSeats?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  availableSeats?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  hotelSummary?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  hotelRating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inclusions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @IsOptional()
  // @ValidateNested()
  @Type(() => IncludesSummary)
  includesSummary?: IncludesSummary;

  @IsOptional()
  program?: unknown;

  @IsOptional()
  hotels?: unknown;

  @IsOptional()
  flights?: unknown;

  @IsOptional()
  pricingOptions?: unknown;

  @IsOptional()
  @IsString()
  departureDate?: string | null;

  @IsOptional()
  @IsString()
  returnDate?: string | null;

  @IsOptional()
  @IsString()
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  seoDescription?: string | null;
}
