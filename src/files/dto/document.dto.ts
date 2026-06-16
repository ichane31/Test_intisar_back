import { IsIn, IsOptional, IsString } from 'class-validator';

const docTypes = ['invoice', 'contract', 'id', 'passport', 'other'] as const;
const docStatuses = ['pending', 'approved', 'rejected'] as const;

export class CreateDocumentDto {
  @IsString()
  name!: string;

  @IsIn(docTypes)
  type!: (typeof docTypes)[number];

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsString()
  url!: string;

  @IsIn(docStatuses)
  status!: (typeof docStatuses)[number];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  uploadedBy!: string;
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(docTypes)
  type?: (typeof docTypes)[number];

  @IsOptional()
  @IsString()
  clientId?: string | null;

  @IsOptional()
  @IsString()
  clientName?: string | null;

  @IsOptional()
  @IsString()
  orderId?: string | null;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsIn(docStatuses)
  status?: (typeof docStatuses)[number];

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  uploadedBy?: string;
}
