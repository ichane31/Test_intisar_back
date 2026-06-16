import { IsArray } from 'class-validator';

export class UpdateComparatorConfigDto {
  /** Ordered list of comparator feature definitions (structure agreed with frontend). */
  @IsArray()
  features!: unknown[];
}
