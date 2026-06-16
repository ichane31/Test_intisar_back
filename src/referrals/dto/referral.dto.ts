// referral.dto.ts
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsBoolean,
  IsMongoId,
  IsDate,
  MinLength,
  MaxLength,
} from 'class-validator';

const referralStatuts = [
  'en_attente',
  'utilise',
  'valide',
  'recompense',
  'expire',
  'annule',
] as const;

export type ReferralStatutType = typeof referralStatuts[number];

export class GenerateReferralDto {
  @IsMongoId()
  @IsString()
  clientId!: string;  // '!' = definite assignment assertion

  @IsOptional()
  @IsNumber()
  @Min(300)
  @Max(1000)
  reductionMAD?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateExpiration?: Date;
}

export class ValidateReferralCodeDto {
  @IsString()
  @MinLength(10)
  @MaxLength(30)
  code!: string;

  @IsOptional()
  @IsString()
  filleulNom?: string;

  @IsOptional()
  @IsEmail()
  filleulEmail?: string;

  @IsOptional()
  @IsString()
  filleulTel?: string;

  @IsOptional()
  @IsMongoId()
  filleulId?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class UseReferralCodeDto {
  @IsString()
  code!: string;

  @IsMongoId()
  filleulId!: string;

  @IsOptional()
  @IsString()
  reservationId?: string;
}

export class PatchReferralDto {
  @IsOptional()
  @IsIn(referralStatuts)
  statut?: ReferralStatutType;

  @IsOptional()
  @IsString()
  reservationId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reductionMAD?: number;

  @IsOptional()
  @IsBoolean()
  reductionUtilisee?: boolean;

  @IsOptional()
  @IsString()
  filleulNom?: string | null;

  @IsOptional()
  @IsEmail()
  filleulEmail?: string | null;

  @IsOptional()
  @IsString()
  filleulTel?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reservationMontant?: number | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateValidation?: Date | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateRecompense?: Date | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateExpiration?: Date | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class ActivateRewardDto {
  @IsMongoId()
  referralId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  montantVerse?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReferralQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(referralStatuts)
  statut?: ReferralStatutType;

  @IsOptional()
  @IsMongoId()
  parrainId?: string;

  @IsOptional()
  @IsMongoId()
  filleulId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateDebut?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateFin?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;  // Avec valeur par défaut, pas besoin de '!'

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;  // Avec valeur par défaut

  @IsOptional()
  @IsString()
  sortBy: 'dateParrainage' | 'dateUtilisation' | 'dateValidation' | 'reductionMAD' = 'dateParrainage';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}

export class ReferralStatsQueryDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateDebut?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateFin?: Date;

  @IsOptional()
  @IsMongoId()
  parrainId?: string;
}

// Pour les DTOs de réponse, on utilise '!' ou valeurs par défaut
export class ValidateReferralCodeResponseDto {
  valid!: boolean;
  message?: string;
  parrainName?: string;
  reductionMAD?: number;
  parrainId?: string;
  code?: string;
  dateExpiration?: Date;
}

export class GenerateReferralCodeResponseDto {
  code!: string;
  reductionMAD!: number;
  dateExpiration?: Date;
  partageUrl?: string;
}

export class ActivateRewardResponseDto {
  success!: boolean;
  message!: string;
  referralId!: string;
  parrainId!: string;
  montant!: number;
  dateRecompense!: Date;
}