import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [
      omraPackCount,
      reservationCount,
      shopOrderCount,
      clientCount,
      leadCount,
      requestCount,
      quotesPending,
      leadsStale,
      shopAgg,
      resPaidAgg,
    ] = await Promise.all([
      this.prisma.omraPack.count(),
      this.prisma.omraReservation.count(),
      this.prisma.shopOrder.count(),
      this.prisma.client.count(),
      this.prisma.lead.count(),
      this.prisma.supportRequest.count(),
      this.prisma.quote.count({ where: { statut: 'en_attente' } }),
      this.prisma.lead.count({
        where: { status: 'new', createdAt: { lt: weekAgo } },
      }),
      this.prisma.shopOrder.aggregate({
        where: { status: { not: 'cancelled' } },
        _sum: { totalAmount: true },
      }),
      this.prisma.omraReservation.aggregate({
        where: { status: { not: 'cancelled' } },
        _sum: { paidAmount: true },
      }),
    ]);

    const shopRevenue = shopAgg._sum.totalAmount ?? 0;
    const omraRevenue = resPaidAgg._sum.paidAmount ?? 0;

    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [shopOrdersRecent, reservationsRecent, recentHistory] =
      await Promise.all([
        this.prisma.shopOrder.findMany({
          where: {
            createdAt: { gte: from },
            status: { not: 'cancelled' },
          },
          select: { createdAt: true, totalAmount: true },
        }),
        this.prisma.omraReservation.findMany({
          where: {
            createdAt: { gte: from },
            status: { not: 'cancelled' },
          },
          select: { createdAt: true, paidAmount: true },
        }),
        this.prisma.historyEntry.findMany({
          take: 15,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    const monthBuckets = new Map<
      string,
      { shop: number; omra: number; month: string }
    >();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      monthBuckets.set(key, {
        month: key,
        shop: 0,
        omra: 0,
      });
    }

    for (const o of shopOrdersRecent) {
      const key = monthKey(new Date(o.createdAt));
      const b = monthBuckets.get(key);
      if (b) b.shop += o.totalAmount;
    }
    for (const r of reservationsRecent) {
      const key = monthKey(new Date(r.createdAt));
      const b = monthBuckets.get(key);
      if (b) b.omra += r.paidAmount;
    }

    const monthlyRevenue = [...monthBuckets.values()];
    const last = monthlyRevenue[monthlyRevenue.length - 1]!;
    const prev = monthlyRevenue[monthlyRevenue.length - 2] ?? last;
    const currentMonthTotal = last.shop + last.omra;
    const prevMonthTotal = prev.shop + prev.omra;
    const pctChange =
      prevMonthTotal === 0
        ? 0
        : ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
    const roundedChange = Math.round(pctChange * 10) / 10;
    const changeType =
      roundedChange === 0
        ? ('neutral' as const)
        : roundedChange > 0
          ? ('increase' as const)
          : ('decrease' as const);

    const recentActivity = recentHistory.map((h) => ({
      id: h.id,
      type: 'audit' as const,
      title: `${h.action} — ${h.entityType}`,
      description: h.entityName,
      timestamp: h.createdAt,
      userName: h.userName,
    }));

    return {
      counts: {
        omraPacks: omraPackCount,
        omraReservations: reservationCount,
        shopOrders: shopOrderCount,
        clients: clientCount,
        leads: leadCount,
        requests: requestCount,
        quotesPending,
        leadsStale,
      },
      revenue: {
        shop: shopRevenue,
        omraPaid: omraRevenue,
        total: shopRevenue + omraRevenue,
      },
      monthlyRevenue,
      recentActivity,
      kpis: [
        {
          key: 'revenue_current_month',
          label: 'Chiffre (mois courant)',
          value: currentMonthTotal,
          previousValue: prevMonthTotal,
          change: Math.abs(roundedChange),
          changeType,
        },
        {
          key: 'total_revenue_all_time',
          label: 'Revenus cumulés (boutique + Omra payé)',
          value: shopRevenue + omraRevenue,
          previousValue: shopRevenue + omraRevenue,
          change: 0,
          changeType: 'neutral' as const,
        },
      ],
    };
  }
}
