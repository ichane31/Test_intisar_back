// dto/admin-user.dto.ts
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const roles = ['SUPER_ADMIN', 'ADMIN'] as const;
const statuses = ['active', 'inactive'] as const;

export class CreateAdminUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name!: string;

  @IsIn(roles)
  role!: (typeof roles)[number];

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];
}

export class UpdateAdminUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(roles)
  role?: (typeof roles)[number];

  @IsOptional()
  @IsString()
  avatar?: string | null;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];
}

// Nouveaux DTOs pour les fonctionnalités de profil
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  avatar?: string | null;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}