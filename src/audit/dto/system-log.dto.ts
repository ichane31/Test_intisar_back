import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

const levels = ['info', 'warning', 'error'] as const;

export class CreateSystemLogDto {
  @IsIn(levels)
  level!: (typeof levels)[number];

  @IsString()
  message!: string;

  @IsString()
  source!: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;
}
