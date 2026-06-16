import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    level: 'info' | 'warn' | 'error',
    message: string,
    details?: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.prisma.systemLog.create({
      data: {
        level,
        message,
        source: 'payment_platform',
        details: details ?? undefined,
      },
    });
  }
}
