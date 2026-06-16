import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

const statuses = ['draft', 'published', 'archived'] as const;

export class CreateFaqDto {
  @IsString()
  question!: string;

  @IsString()
  answer!: string;

  @IsString()
  category!: string;

  @Type(() => Number)
  @IsInt()
  order!: number;

  @IsIn(statuses)
  status!: (typeof statuses)[number];
}

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];
}
