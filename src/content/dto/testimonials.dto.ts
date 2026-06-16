import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const statuses = ['draft', 'published', 'archived'] as const;
const tripTypes = ['omra', 'hajj', 'combine'] as const;

export class CreateTestimonialDto {
  @IsString()
  clientName!: string;

  @IsString()
  clientPhoto!: string;

  @IsIn(tripTypes)
  tripType!: (typeof tripTypes)[number];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  content!: string;

  @IsIn(statuses)
  status!: (typeof statuses)[number];
}

export class UpdateTestimonialDto {
  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  clientPhoto?: string;

  @IsOptional()
  @IsIn(tripTypes)
  tripType?: (typeof tripTypes)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];
}
