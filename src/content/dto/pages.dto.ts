import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

const statuses = ['draft', 'published', 'archived'] as const;

export class CreatePageDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  content!: string;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsIn(statuses)
  status!: (typeof statuses)[number];
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  seoDescription?: string | null;

  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];
}
