import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const orderStatuses = ['pending', 'confirmed', 'cancelled', 'refunded'] as const;
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'] as const;

export class ShopOrderListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(orderStatuses)
  status?: (typeof orderStatuses)[number];

  @IsOptional()
  @IsIn(paymentStatuses)
  paymentStatus?: (typeof paymentStatuses)[number];

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
