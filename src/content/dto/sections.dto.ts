import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

const statuses = ['draft', 'published', 'archived'] as const;

export class CreateSectionDto {
  @IsString()
  pageId!: string;

  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @Type(() => Number)
  @IsInt()
  order!: number;

  @IsIn(statuses)
  status!: (typeof statuses)[number];
}

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  pageId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];
}
