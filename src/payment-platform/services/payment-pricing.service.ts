import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PAYABLE_MODE } from '../constants/payment-status';

export type CartLineInput = {
  kind: 'omra_pack' | 'shop_product' | 'custom';
  refId?: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

@Injectable()
export class PaymentPricingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcule sous-total, remise promo (offre spéciale liée au pack si présent), taxes (0 par défaut).
   */
  async computeTotals(input: {
    lines: CartLineInput[];
    promoCode?: string | null;
    payableMode: (typeof PAYABLE_MODE)[keyof typeof PAYABLE_MODE];
    depositPercent?: number;
  }): Promise<{
    lines: Prisma.JsonValue;
    subtotalAmount: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    promoCode: string | null;
  }> {
    let subtotal = 0;
    for (const line of input.lines) {
      subtotal += line.unitPrice * line.quantity;
    }

    let discount = 0;
    let promoCode: string | null = input.promoCode?.trim() || null;

    if (promoCode) {
      const omraLine = input.lines.find((l) => l.kind === 'omra_pack' && l.refId);
      if (omraLine?.refId) {
        const now = new Date();
        const offer = await this.prisma.specialOffer.findFirst({
          where: {
            id: promoCode,
            packId: omraLine.refId,
            status: 'active',
            validFrom: { lte: now },
            validTo: { gte: now },
          },
        });
        if (offer) {
          discount = Math.max(0, offer.originalPrice - offer.discountedPrice);
        }
      }
      if (discount === 0) {
        const pct = Number(process.env.PAYMENT_LAB_PROMO_PERCENT ?? '0');
        if (pct > 0 && pct <= 100) {
          discount = (subtotal * pct) / 100;
        }
      }
    }

    const taxAmount = 0;
    const afterDiscount = Math.max(0, subtotal - discount);
    let totalAmount = afterDiscount + taxAmount;

    if (input.payableMode === PAYABLE_MODE.DEPOSIT) {
      const pct = input.depositPercent ?? 30;
      totalAmount = (afterDiscount * Math.min(100, Math.max(1, pct))) / 100;
    } else if (input.payableMode === PAYABLE_MODE.BALANCE) {
      totalAmount = afterDiscount;
    }

    const linesJson: Prisma.JsonValue = input.lines as unknown as Prisma.JsonValue;

    return {
      lines: linesJson,
      subtotalAmount: subtotal,
      discountAmount: discount,
      taxAmount,
      totalAmount,
      promoCode,
    };
  }

  async priceOmraPackFromCatalog(packId: string): Promise<{
    title: string;
    unitPrice: number;
    currency: string;
  }> {
    const pack = await this.prisma.omraPack.findUnique({ where: { id: packId } });
    if (!pack) {
      throw new NotFoundException('Pack Omra introuvable');
    }
    const unitPrice = pack.promoPrice ?? pack.basePrice;
    return { title: pack.title, unitPrice, currency: 'MAD' };
  }
}
