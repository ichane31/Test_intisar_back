import { IsObject } from 'class-validator';

export class ReplaceOmraSurMesureConfigDto {
  @IsObject()
  payload!: Record<string, unknown>;
}

export class PatchOmraSurMesureConfigDto {
  @IsObject()
  payload!: Record<string, unknown>;
}
