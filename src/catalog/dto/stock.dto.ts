import { Type } from 'class-transformer';
import { IsIn, IsInt, IsString, Min } from 'class-validator';

const movementTypes = ['in', 'out', 'adjustment'] as const;

export class CreateStockMovementDto {
  @IsString()
  productId!: string;

  @IsString()
  productName!: string;

  @IsIn(movementTypes)
  type!: (typeof movementTypes)[number];

  @Type(() => Number)
  @IsInt()
  quantity!: number;

  @IsString()
  reason!: string;

  @IsString()
  createdBy!: string;
}
