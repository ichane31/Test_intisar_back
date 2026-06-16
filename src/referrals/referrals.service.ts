import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  GenerateReferralDto,
  PatchReferralDto,
  ValidateReferralCodeDto,
  UseReferralCodeDto,
  ActivateRewardDto,
  ReferralQueryDto,
  ReferralStatsQueryDto,
} from './dto/referral.dto';
import { ReferralStatut } from '@prisma/client'; // Importer l'enum généré

function normalizePrenom(firstName: string): string {
  const s = firstName
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z]/g, '')
    .slice(0, 12);
  return s || 'CLIENT';
}

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  // Récupérer tous les parrainages avec filtres
  async findAll(query?: ReferralQueryDto) {
    const {
      search,
      statut,
      parrainId,
      filleulId,
      dateDebut,
      dateFin,
      page = 1,
      limit = 10,
      sortBy = 'dateParrainage',
      sortOrder = 'desc',
    } = query || {};

    const where: any = {};

    if (statut) where.statut = statut;
    if (parrainId) where.parrainId = parrainId;
    if (filleulId) where.filleulId = filleulId;

    if (dateDebut || dateFin) {
      where.dateParrainage = {};
      if (dateDebut) where.dateParrainage.gte = dateDebut;
      if (dateFin) where.dateParrainage.lte = dateFin;
    }

    if (search) {
      where.OR = [
        { parrainCode: { contains: search, mode: 'insensitive' } },
        { parrainNom: { contains: search, mode: 'insensitive' } },
        { filleulNom: { contains: search, mode: 'insensitive' } },
        { filleulEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.referral.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.referral.count({ where }),
    ]);

    console.log('data refferals', data);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Récupérer un parrainage par ID
  async findOne(id: string) {
    const referral = await this.prisma.referral.findUnique({ where: { id } });
    if (!referral) throw new NotFoundException('Parrainage introuvable');
    return referral;
  }

  // Récupérer les parrainages d'un client
  async findByClient(clientId: string) {
    return this.prisma.referral.findMany({
      where: { parrainId: clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Récupérer les filleulages d'un client
  async findByFilleul(filleulId: string) {
    return this.prisma.referral.findMany({
      where: { filleulId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Générer un code unique pour un client
  async ensureClientCode(clientId: string): Promise<string> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException('Client introuvable');
    if (client.referralCode) return client.referralCode;

    const prenom = normalizePrenom(client.firstName);
    for (let i = 0; i < 20; i++) {
      const digits = String(Math.floor(1000 + Math.random() * 9000));
      const code = `INTISAR-${prenom}-${digits}`;
      const exists = await this.prisma.client.findFirst({
        where: { referralCode: code },
      });
      if (!exists) {
        await this.prisma.client.update({
          where: { id: clientId },
          data: { referralCode: code },
        });
        return code;
      }
    }
    throw new BadRequestException('Impossible de générer un code unique');
  }

  // Générer un code (admin)
  async generate(dto: GenerateReferralDto) {
    const code = await this.ensureClientCode(dto.clientId);
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });

    // Créer un enregistrement de parrainage
    const referral = await this.prisma.referral.create({
      data: {
        parrainId: dto.clientId,
        parrainNom: `${client?.firstName} ${client?.lastName}`,
        parrainCode: code,
        parrainEmail: client?.email,
        parrainTel: client?.phone,
        reductionMAD: dto.reductionMAD || 500,
        dateExpiration: dto.dateExpiration || null,
        statut: ReferralStatut.en_attente,
      },
    });

    return {
      clientId: dto.clientId,
      parrainCode: code,
      reductionMAD: referral.reductionMAD,
      dateExpiration: referral.dateExpiration,
      partageUrl: `${process.env.FRONTEND_URL}/inscription?code=${code}`,
    };
  }

  // Valider un code (sans créer de lien)
  async validateCode(dto: ValidateReferralCodeDto) {
    const code = dto.code.trim().toUpperCase();

    const parrain = await this.prisma.client.findFirst({
      where: { referralCode: code },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!parrain) {
      return { valid: false, message: 'Code inconnu' };
    }

    // Vérifier si le code a expiré
    const existingReferral = await this.prisma.referral.findFirst({
      where: {
        parrainCode: code,
        statut: { in: [ReferralStatut.en_attente, ReferralStatut.utilise] },
      },
    });

    if (
      existingReferral?.dateExpiration &&
      existingReferral.dateExpiration < new Date()
    ) {
      return { valid: false, message: 'Code expiré' };
    }

    // Vérifier que le filleul n'utilise pas son propre code
    if (dto.filleulId && dto.filleulId === parrain.id) {
      return {
        valid: false,
        message: 'Vous ne pouvez pas utiliser votre propre code',
      };
    }

    // Vérifier que le filleul n'a pas déjà utilisé un code
    if (dto.filleulId) {
      const existingUse = await this.prisma.referral.findFirst({
        where: {
          filleulId: dto.filleulId,
          statut: {
            in: [
              ReferralStatut.utilise,
              ReferralStatut.valide,
              ReferralStatut.recompense,
            ],
          },
        },
      });
      if (existingUse) {
        return {
          valid: false,
          message: 'Vous avez déjà utilisé un code de parrainage',
        };
      }
    }

    return {
      valid: true,
      parrainId: parrain.id,
      parrainName: `${parrain.firstName} ${parrain.lastName}`,
      reductionMAD: 500,
      message: 'Code valide — 500 MAD déductibles',
    };
  }

  // Utiliser un code (créer le lien filleul)
  async useCode(dto: UseReferralCodeDto) {
    const code = dto.code.trim().toUpperCase();

    const parrain = await this.prisma.client.findFirst({
      where: { referralCode: code },
    });

    if (!parrain) {
      throw new NotFoundException('Code invalide');
    }

    // Vérifier que le filleul n'existe pas déjà
    const existingUse = await this.prisma.referral.findFirst({
      where: {
        filleulId: dto.filleulId,
        statut: {
          in: [
            ReferralStatut.utilise,
            ReferralStatut.valide,
            ReferralStatut.recompense,
          ],
        },
      },
    });

    if (existingUse) {
      throw new ConflictException(
        'Ce client a déjà utilisé un code de parrainage'
      );
    }

    // Créer l'enregistrement
    const referral = await this.prisma.referral.create({
      data: {
        parrainId: parrain.id,
        parrainNom: `${parrain.firstName} ${parrain.lastName}`,
        parrainCode: code,
        parrainEmail: parrain.email,
        filleulId: dto.filleulId,
        reservationId: dto.reservationId,
        reductionMAD: 500,
        statut: dto.reservationId
          ? ReferralStatut.valide
          : ReferralStatut.utilise,
        dateUtilisation: new Date(),
        dateValidation: dto.reservationId ? new Date() : null,
      },
    });

    return referral;
  }

  // Attacher une réservation à un parrainage
  async attachReservation(
    referralId: string,
    reservationId: string,
    reservationMontant?: number
  ) {
    const referral = await this.findOne(referralId);

    if (
      referral.statut !== ReferralStatut.utilise &&
      referral.statut !== ReferralStatut.en_attente
    ) {
      throw new BadRequestException(
        'Ce parrainage ne peut pas recevoir de réservation'
      );
    }

    return this.prisma.referral.update({
      where: { id: referralId },
      data: {
        reservationId,
        reservationMontant,
        statut: ReferralStatut.valide,
        dateValidation: new Date(),
      },
    });
  }

  // Appelé quand paymentStatus passe à paid
  async onReservationPaid(reservationId: string) {
    const referral = await this.prisma.referral.findFirst({
      where: {
        reservationId,
        statut: ReferralStatut.valide,
      },
    });

    if (!referral) return;

    // Vérifier délai de rétractation (7 jours par exemple)
    const daysSinceValidation =
      (new Date().getTime() - referral.dateValidation!.getTime()) /
      (1000 * 3600 * 24);

    if (daysSinceValidation >= 7) {
      await this.prisma.referral.update({
        where: { id: referral.id },
        data: {
          statut: ReferralStatut.recompense,
        },
      });
    }
  }

  // Activer manuellement une récompense (admin)
  async activateReward(id: string, dto?: ActivateRewardDto) {
    const referral = await this.findOne(id);

    if (referral.statut !== ReferralStatut.valide) {
      throw new BadRequestException(
        'Seule une récompense au statut "valide" peut être activée'
      );
    }

    const updated = await this.prisma.referral.update({
      where: { id },
      data: {
        statut: ReferralStatut.recompense,
        dateRecompense: new Date(),
        notes: dto?.notes,
      },
    });

    // TODO: Envoyer notification au parrain
    // await this.notificationService.sendRewardNotification(updated);

    return updated;
  }

  // Mettre à jour un parrainage
  async patch(id: string, dto: PatchReferralDto) {
    await this.findOne(id);

    return this.prisma.referral.update({
      where: { id },
      data: {
        ...(dto.statut !== undefined && { statut: dto.statut }),
        ...(dto.reservationId !== undefined && {
          reservationId: dto.reservationId,
        }),
        ...(dto.reductionMAD !== undefined && {
          reductionMAD: dto.reductionMAD,
        }),
        ...(dto.reductionUtilisee !== undefined && {
          reductionUtilisee: dto.reductionUtilisee,
        }),
        ...(dto.filleulNom !== undefined && { filleulNom: dto.filleulNom }),
        ...(dto.filleulEmail !== undefined && {
          filleulEmail: dto.filleulEmail,
        }),
        ...(dto.filleulTel !== undefined && { filleulTel: dto.filleulTel }),
        ...(dto.reservationMontant !== undefined && {
          reservationMontant: dto.reservationMontant,
        }),
        ...(dto.dateValidation !== undefined && {
          dateValidation: dto.dateValidation,
        }),
        ...(dto.dateRecompense !== undefined && {
          dateRecompense: dto.dateRecompense,
        }),
        ...(dto.dateExpiration !== undefined && {
          dateExpiration: dto.dateExpiration,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        updatedAt: new Date(),
      },
    });
  }

  // Statistiques des parrainages
  async getStats(query?: ReferralStatsQueryDto) {
    const { dateDebut, dateFin, parrainId } = query || {};

    const where: any = {};
    if (parrainId) where.parrainId = parrainId;
    if (dateDebut || dateFin) {
      where.dateParrainage = {};
      if (dateDebut) where.dateParrainage.gte = dateDebut;
      if (dateFin) where.dateParrainage.lte = dateFin;
    }

    const [total, byStatus, totalReduction] = await Promise.all([
      this.prisma.referral.count({ where }),
      this.prisma.referral.groupBy({
        by: ['statut'],
        where,
        _count: true,
      }),
      this.prisma.referral.aggregate({
        where: { ...where, statut: ReferralStatut.recompense },
        _sum: { reductionMAD: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((s) => ({ statut: s.statut, count: s._count })),
      totalReductionDistribuee: totalReduction._sum.reductionMAD || 0,
    };
  }

  // Vérifier les codes expirés (à exécuter périodiquement)
  async expireOldCodes() {
    const result = await this.prisma.referral.updateMany({
      where: {
        statut: ReferralStatut.en_attente,
        dateExpiration: { lt: new Date() },
      },
      data: {
        statut: ReferralStatut.expire,
      },
    });

    return { expiredCount: result.count };
  }

  // referrals.service.ts - Ajouter cette méthode

  // Supprimer un parrainage (admin)
  // referrals.service.ts - Méthode deleteReferral corrigée

  async deleteReferral(
    id: string
  ): Promise<{ deleted: boolean; message: string }> {
    const referral = await this.findOne(id);

    // Ne permettre la suppression que pour certains statuts
    const allowedStatuses = ['en_attente', 'expire', 'annule'];
    if (!allowedStatuses.includes(referral.statut)) {
      throw new BadRequestException(
        `Impossible de supprimer un parrainage au statut "${referral.statut}". Seuls les statuts "en_attente", "expire" ou "annule" peuvent être supprimés.`
      );
    }

    // Vérifier si le client a d'autres codes de parrainage
    const otherReferrals = await this.prisma.referral.findMany({
      where: {
        parrainId: referral.parrainId,
        id: { not: id },
        statut: { not: 'annule' },
      },
    });

    // Supprimer le référentiel
    await this.prisma.referral.delete({
      where: { id },
    });

    // Si le client n'a plus aucun code de parrainage actif, on supprime son code
    if (otherReferrals.length === 0) {
      await this.prisma.client.update({
        where: { id: referral.parrainId },
        data: { referralCode: null },
      });
    }

    return {
      deleted: true,
      message: 'Parrainage supprimé avec succès',
    };
  }
}
