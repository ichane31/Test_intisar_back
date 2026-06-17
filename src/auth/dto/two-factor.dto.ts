// auth/dto/two-factor.dto.ts
import { IsBoolean, IsOptional, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class SetupTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class EnableTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code!: string;

  @IsString()
  @IsNotEmpty()
  secret!: string;
}

export class VerifyTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code!: string;
}

export class DisableTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code!: string;
}

export class RegenerateBackupCodesDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code!: string;
}

export class TwoFactorSetupResponseDto {
  secret!: string;
  qrCode!: string;
  backupCodes!: string[];
}

export class TwoFactorEnableResponseDto {
  success!: boolean;
  message!: string;
  backupCodes!: string[];
}

export class TwoFactorVerifyResponseDto {
  valid!: boolean;
  accessToken?: string;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    phone?: string;
    twoFactorEnabled?: boolean;
  };
}

export class TwoFactorDisableResponseDto {
  success!: boolean;
  message!: string;
}

export class TwoFactorStatusResponseDto {
  enabled!: boolean;
}