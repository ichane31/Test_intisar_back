import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  createdAtBounds,
  listMeta,
  normalizePagination,
} from '../common/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import type { ClientListQueryDto } from './dto/client-list-query.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ClientListQueryDto) {
    const where: Prisma.ClientWhereInput = {};
    if (query.search) {
      const q = query.search;
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }
    const bounds = createdAtBounds(query.createdFrom, query.createdTo);
    if (bounds) where.createdAt = bounds;
    const orderBy = { updatedAt: 'desc' as const };
    const { page, limit, skip } = normalizePagination(query.page, query.limit);
    const [total, data] = await Promise.all([
      this.prisma.client.count({ where }),
      this.prisma.client.findMany({ where, orderBy, skip, take: limit }),
    ]);
    return { data, meta: listMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const row = await this.prisma.client.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Client not found');
    return row;
  }

  async findAllComplets(query: ClientListQueryDto) {

    console.log("test  get infos")
    const where: Prisma.ClientWhereInput = {};
    if (query.search) {
      const q = query.search;
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }
    const bounds = createdAtBounds(query.createdFrom, query.createdTo);
    if (bounds) where.createdAt = bounds;
    const orderBy = { updatedAt: 'desc' as const };
    const { page, limit, skip } = normalizePagination(query.page, query.limit);
    
    const [total, data] = await Promise.all([
      this.prisma.client.count({ where }),
      this.prisma.client.findMany({ where, orderBy, skip, take: limit }),
    ]);
    
    // Enrichir les données avec les statistiques
    const enrichedData = await Promise.all(
      data.map(async (client) => {
        const stats = await this.getClientStats(client.id);
        return {
          ...client,
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          lastOrderDate: stats.lastOrderDate,
        };
      })
    );
    
    return { data: enrichedData, meta: listMeta(total, page, limit) };
  }

  async findOneComplet(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');
    
    const stats = await this.getClientStats(id);
    return {
      ...client,
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      lastOrderDate: stats.lastOrderDate,
    };
  }

  /**
   * Récupère les statistiques complètes d'un client incluant :
   * - totalOrders: nombre total de commandes (shop + omra)
   * - totalSpent: montant total dépensé (shop + omra)
   * - lastOrderDate: date de la dernière commande
   * - shopOrdersCount: nombre de commandes boutique
   * - shopTotalSpent: montant total dépensé en boutique
   * - omraReservationsCount: nombre de réservations Omra
   * - omraTotalSpent: montant total dépensé en Omra
   * - averageOrderValue: panier moyen
   */
  async getClientStats(clientId: string) {
    // Récupérer les commandes boutique
    const shopOrders = await this.prisma.shopOrder.findMany({
      where: { clientId },
      select: {
        totalAmount: true,
        createdAt: true,
        paymentStatus: true,
      },
    });

    // Récupérer les réservations Omra
    const omraReservations = await this.prisma.omraReservation.findMany({
      where: { clientId },
      select: {
        totalAmount: true,
        createdAt: true,
        paymentStatus: true,
      },
    });

    // Calculer les totaux (uniquement les commandes payées ou partielles)
    const shopPaidOrders = shopOrders.filter(o => 
      o.paymentStatus === 'paid' || o.paymentStatus === 'partial'
    );
    const omraPaidReservations = omraReservations.filter(r => 
      r.paymentStatus === 'paid' || r.paymentStatus === 'partial'
    );

    const shopTotalSpent = shopPaidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const omraTotalSpent = omraPaidReservations.reduce((sum, r) => sum + r.totalAmount, 0);
    
    const totalOrders = shopOrders.length + omraReservations.length;
    const totalSpent = shopTotalSpent + omraTotalSpent;
    
    // Trouver la date de la dernière commande
    const allOrders = [
      ...shopOrders.map(o => ({ date: o.createdAt, type: 'shop' as const })),
      ...omraReservations.map(r => ({ date: r.createdAt, type: 'omra' as const })),
    ];
    
    const lastOrder = allOrders.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return {
      totalOrders,
      totalSpent,
      lastOrderDate: lastOrder?.date || null,
      shopOrdersCount: shopOrders.length,
      shopTotalSpent,
      omraReservationsCount: omraReservations.length,
      omraTotalSpent,
      averageOrderValue,
    };
  }

  /**
   * Récupère l'historique complet des commandes d'un client
   */
  async getClientOrderHistory(clientId: string) {
    const [shopOrders, omraReservations] = await Promise.all([
      this.prisma.shopOrder.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.omraReservation.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      shopOrders,
      omraReservations,
      totalOrders: shopOrders.length + omraReservations.length,
    };
  }

  /**
   * Récupère les clients les plus actifs (meilleurs dépensiers)
   */
  async getTopClients(limit: number = 10) {
    const clients = await this.prisma.client.findMany({
      take: limit,
    });

    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const stats = await this.getClientStats(client.id);
        return {
          ...client,
          ...stats,
        };
      })
    );

    return clientsWithStats.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  async create(dto: CreateClientDto) {
    try {
      return await this.prisma.client.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          city: dto.city,
          country: dto.country,
          totalOrders: dto.totalOrders ?? 0,
          totalSpent: dto.totalSpent ?? 0,
          lastOrderDate: dto.lastOrderDate
            ? new Date(dto.lastOrderDate)
            : undefined,
          notes: dto.notes,
        },
      });
    } catch {
      throw new ConflictException('Email already in use');
    }
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);
    try {
      return await this.prisma.client.update({
        where: { id },
        data: dto,
      });
    } catch {
      throw new ConflictException('Email already in use');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.client.delete({ where: { id } });
    return { success: true };
  }
}
