import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

const statuses = ['draft', 'published', 'archived'] as const;

export class CreateGuideDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  content!: string;

  @IsString()
  category!: string;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsIn(statuses)
  status!: (typeof statuses)[number];
}

export class UpdateGuideDto {
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
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];
}
