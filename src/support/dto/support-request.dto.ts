// dto/support-request.dto.ts
import { IsIn, IsOptional, IsString, IsEmail } from 'class-validator';

const types = ['whatsapp', 'form', 'inscription'] as const;
const statuses = ['new', 'in_progress', 'completed', 'closed'] as const;

export class CreateSupportRequestDto {
  @IsIn(types)
  type!: (typeof types)[number];

  @IsString()
  clientName!: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsString()
  subject!: string;

  @IsString()
  message!: string;

  @IsIn(statuses)
  status!: (typeof statuses)[number];

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  response?: string;
}

export class UpdateSupportRequestDto {
  @IsOptional()
  @IsIn(types)
  type?: (typeof types)[number];

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string | null;

  @IsOptional()
  @IsString()
  clientPhone?: string | null;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];

  @IsOptional()
  @IsString()
  assignedTo?: string | null;

  @IsOptional()
  @IsString()
  response?: string | null;
}