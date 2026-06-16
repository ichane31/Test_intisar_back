import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const leadStatuses = [
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost',
] as const;

const leadSources = [
  'website',
  'whatsapp',
  'phone',
  'referral',
  'social',
  'other',
] as const;

export class CreateLeadDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsIn(leadSources)
  source!: (typeof leadSources)[number];

  @IsString()
  interest!: string;

  @IsIn(leadStatuses)
  status!: (typeof leadStatuses)[number];

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsString()
  lastContactAt?: string;

  @IsOptional()
  @IsString()
  convertedClientId?: string;
}

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsIn(leadSources)
  source?: (typeof leadSources)[number];

  @IsOptional()
  @IsString()
  interest?: string;

  @IsOptional()
  @IsIn(leadStatuses)
  status?: (typeof leadStatuses)[number];

  @IsOptional()
  @IsString()
  assignedTo?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number | null;

  @IsOptional()
  @IsString()
  lastContactAt?: string | null;

  @IsOptional()
  @IsString()
  convertedClientId?: string | null;
}
