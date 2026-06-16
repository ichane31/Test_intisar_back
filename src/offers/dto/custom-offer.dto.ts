import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

const customStatuses = ['pending', 'quoted', 'accepted', 'rejected'] as const;

export class CreateCustomOfferDto {
  @IsString()
  clientId!: string;

  @IsString()
  clientName!: string;

  @IsString()
  requirements!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proposedPrice?: number;

  /** Must be `pending` for new dossiers (enforced in service). */
  @IsOptional()
  @IsIn(customStatuses)
  status?: (typeof customStatuses)[number];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCustomOfferDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  proposedPrice?: number | null;

  @IsOptional()
  @IsIn(customStatuses)
  status?: (typeof customStatuses)[number];

  @IsOptional()
  @IsString()
  notes?: string | null;
}
