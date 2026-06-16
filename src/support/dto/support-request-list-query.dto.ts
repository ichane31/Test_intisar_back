import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const types = ['whatsapp', 'form', 'inscription'] as const;

export class SupportRequestListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(types)
  type?: (typeof types)[number];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;
}
