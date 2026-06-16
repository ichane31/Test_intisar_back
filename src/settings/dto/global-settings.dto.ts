import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateGlobalSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteEmail?: string;

  @IsOptional()
  @IsString()
  sitePhone?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsString()
  siteDescription?: string | null;

  @IsOptional()
  @IsString()
  companyAddress?: string | null;

  @IsOptional()
  @IsString()
  defaultLanguage?: string | null;
}
