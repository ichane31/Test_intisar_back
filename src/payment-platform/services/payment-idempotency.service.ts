import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentIdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  hashPayload(payload: unknown): string {
    return createHash('sha256')
      .update(JSON.stringify(payload ?? {}))
      .digest('hex');
  }

  async getCached(
    key: string,
    scope: string,
    requestHash: string,
  ): Promise<{ httpStatus: number; body: Prisma.JsonValue } | null> {
    const row = await this.prisma.paymentIdempotencyRecord.findUnique({
      where: { key },
    });
    if (!row || row.scope !== scope || row.requestHash !== requestHash) {
      return null;
    }
    return { httpStatus: row.httpStatus, body: row.responseBody };
  }

  async save(
    key: string,
    scope: string,
    requestHash: string,
    httpStatus: number,
    body: Prisma.JsonValue,
  ): Promise<void> {
    await this.prisma.paymentIdempotencyRecord.create({
      data: {
        key,
        scope,
        requestHash,
        httpStatus,
        responseBody: body as Prisma.InputJsonValue,
      },
    });
  }
}
