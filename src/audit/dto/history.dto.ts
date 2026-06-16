import { IsIn, IsOptional, IsString } from 'class-validator';

const actions = [
  'create',
  'update',
  'delete',
  'archive',
  'login',
  'logout',
  'export',
] as const;

export class CreateHistoryEntryDto {
  @IsString()
  userId!: string;

  @IsString()
  userName!: string;

  @IsIn(actions)
  action!: (typeof actions)[number];

  @IsString()
  entityType!: string;

  @IsString()
  entityId!: string;

  @IsString()
  entityName!: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
