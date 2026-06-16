import { IsIn, IsOptional, IsString } from 'class-validator';

const statuses = ['draft', 'published', 'archived'] as const;
const types = ['terms', 'privacy', 'cookies', 'other'] as const;

export class CreateLegalContentDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  content!: string;

  @IsIn(types)
  type!: (typeof types)[number];

  @IsIn(statuses)
  status!: (typeof statuses)[number];
}

export class UpdateLegalContentDto {
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
  @IsIn(types)
  type?: (typeof types)[number];

  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];
}
