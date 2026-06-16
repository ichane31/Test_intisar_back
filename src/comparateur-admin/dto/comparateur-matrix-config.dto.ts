import { IsObject } from 'class-validator';

export class ReplaceComparateurMatrixConfigDto {
  @IsObject()
  payload!: Record<string, unknown>;
}

export class PatchComparateurMatrixConfigDto {
  @IsObject()
  payload!: Record<string, unknown>;
}
