import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

const mediaTypes = ['image', 'video', 'document'] as const;

export class CreateMediaFileDto {
  @IsString()
  name!: string;

  @IsIn(mediaTypes)
  type!: (typeof mediaTypes)[number];

  @IsString()
  url!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  size!: number;

  @IsString()
  mimeType!: string;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  height?: number;

  @IsString()
  uploadedBy!: string;
}

export class UpdateMediaFileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(mediaTypes)
  type?: (typeof mediaTypes)[number];

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  size?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  alt?: string | null;

  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @IsOptional()
  @IsString()
  folder?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  width?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  height?: number | null;
}
