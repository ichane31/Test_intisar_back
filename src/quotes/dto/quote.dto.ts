import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

const quoteStatuts = [
  'en_attente',
  'envoye',
  'accepte',
  'refuse',
  'expire',
] as const;

export type RemiseType = 'montant' | 'pourcentage';

export class CreateQuoteDto {
  @IsString()
  clientNom!: string;

  @IsEmail()
  clientEmail!: string;

  @IsString()
  clientTel!: string;

  @IsOptional()
  @IsString()
  clientVille?: string;

  @IsString()
  packId!: string;

  @IsOptional()
  @IsString()
  packTitle?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  nbPersonnes!: number;

  @IsOptional()
  @IsString()
  dateDepart?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  montantTotal!: number;

  // Nouveau: type de remise
  @IsOptional()
  @IsIn(['montant', 'pourcentage'])
  remiseType?: RemiseType;

  // Valeur de la remise (peut être montant fixe ou pourcentage)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  remiseValeur?: number;

  // Montant de la remise calculé (pour compatibilité)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  remise?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  validiteJours?: number;

  @IsOptional()
  @IsString()
  leadId?: string;
}

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  clientNom?: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @IsOptional()
  @IsString()
  clientTel?: string;

  @IsOptional()
  @IsString()
  clientVille?: string | null;

  @IsOptional()
  @IsString()
  packId?: string;

  @IsOptional()
  @IsString()
  packTitle?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  nbPersonnes?: number;

  @IsOptional()
  @IsString()
  dateDepart?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  montantTotal?: number;

  // Nouveau: type de remise
  @IsOptional()
  @IsIn(['montant', 'pourcentage'])
  remiseType?: RemiseType;

  // Valeur de la remise
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  remiseValeur?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  remise?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  montantFinal?: number;

  @IsOptional()
  @IsIn(quoteStatuts)
  statut?: (typeof quoteStatuts)[number];

  @IsOptional()
  @IsString()
  pdfUrl?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  validiteJours?: number;
}