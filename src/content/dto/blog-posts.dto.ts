import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

const statuses = ['draft', 'published', 'archived'] as const;

export class CreateBlogPostDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  excerpt!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsString()
  author!: string;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsIn(statuses)
  status!: (typeof statuses)[number];

  @IsOptional()
  @IsString()
  publishedAt?: string;
}

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  coverImage?: string | null;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];

  @IsOptional()
  @IsString()
  publishedAt?: string | null;
}
