import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateQuoteDto, UpdateQuoteDto, RemiseType } from './dto/quote.dto';
import { buildQuotePdfBuffer } from './quote-pdf.util';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextNumero(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.quote.count({
      where: { numero: { startsWith: `DEV-${year}-` } },
    });
    const seq = String(count + 1).padStart(4, '0');
    return `DEV-${year}-${seq}`;
  }

  /**
   * Calcule le montant de la remise basé sur le type et la valeur
   * @param montantBase - Montant de base avant remise (prix du pack * nb personnes)
   * @param remiseType - Type de remise ('montant' ou 'pourcentage')
   * @param remiseValeur - Valeur de la remise (montant fixe ou pourcentage)
   * @returns Montant de la remise calculé
   */
  private calculateRemise(
    montantBase: number,
    remiseType: RemiseType,
    remiseValeur: number,
  ): number {
    if (remiseValeur <= 0) return 0;

    if (remiseType === 'pourcentage') {
      // Pourcentage: ne peut pas dépasser 100%
      const pourcentage = Math.min(remiseValeur, 100);
      return (montantBase * pourcentage) / 100;
    } else {
      // Montant fixe: ne peut pas dépasser le montant total
      return Math.min(remiseValeur, montantBase);
    }
  }

  /**
   * Calcule le montant final après remise
   * @param montantTotal - Montant total avant remise
   * @param remise - Montant de la remise
   * @returns Montant final (toujours >= 0)
   */
  private calculateMontantFinal(montantTotal: number, remise: number): number {
    return Math.max(0, montantTotal - remise);
  }

  findAll() {
    return this.prisma.quote.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.quote.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Devis introuvable');
    return row;
  }

  async create(dto: CreateQuoteDto) {
    // Validation du pack
    const pack = await this.prisma.omraPack.findUnique({
      where: { id: dto.packId },
    });
    if (!pack) {
      throw new BadRequestException('Pack non trouvé');
    }

    // Calcul du montant de base (prix du pack * nombre de personnes)
    const montantBase = pack.basePrice * dto.nbPersonnes;
    
    // Validation du montant total si fourni
    let montantTotal = dto.montantTotal;
    if (montantTotal && montantTotal !== montantBase) {
      // Si l'utilisateur a modifié le montant total, on l'utilise tel quel
      montantTotal = dto.montantTotal;
    } else {
      montantTotal = montantBase;
    }

    // Gestion de la remise
    let remiseMontant = 0;
    let remiseType: RemiseType = dto.remiseType ?? 'montant';
    let remiseValeur = dto.remiseValeur ?? 0;

    // Compatibilité avec l'ancien champ 'remise'
    if (dto.remise !== undefined && dto.remise > 0 && !dto.remiseValeur) {
      remiseType = 'montant';
      remiseValeur = dto.remise;
      remiseMontant = Math.min(dto.remise, montantTotal);
    } else if (remiseValeur > 0) {
      remiseMontant = this.calculateRemise(montantTotal, remiseType, remiseValeur);
    }

    const montantFinal = this.calculateMontantFinal(montantTotal, remiseMontant);

    const packTitle = dto.packTitle ?? pack.title;
    const numero = await this.nextNumero();

    return this.prisma.quote.create({
      data: {
        numero,
        clientNom: dto.clientNom,
        clientEmail: dto.clientEmail,
        clientTel: dto.clientTel,
        clientVille: dto.clientVille,
        packId: dto.packId,
        packTitle,
        nbPersonnes: dto.nbPersonnes,
        dateDepart: dto.dateDepart ? new Date(dto.dateDepart) : null,
        montantTotal,
        remiseType,
        remiseValeur,
        remise: remiseMontant,
        montantFinal,
        statut: 'en_attente',
        notes: dto.notes,
        validiteJours: dto.validiteJours ?? 7,
        leadId: dto.leadId,
      },
    });
  }

  async update(id: string, dto: UpdateQuoteDto) {
    const current = await this.findOne(id);
    
    // Récupérer le pack pour le prix de base
    const pack = await this.prisma.omraPack.findUnique({
      where: { id: dto.packId ?? current.packId },
    });

    const data: Prisma.QuoteUpdateInput = {};
    
    // Champs simples
    if (dto.clientNom !== undefined) data.clientNom = dto.clientNom;
    if (dto.clientEmail !== undefined) data.clientEmail = dto.clientEmail;
    if (dto.clientTel !== undefined) data.clientTel = dto.clientTel;
    if (dto.clientVille !== undefined) data.clientVille = dto.clientVille;
    if (dto.packId !== undefined) data.packId = dto.packId;
    if (dto.packTitle !== undefined) data.packTitle = dto.packTitle;
    if (dto.nbPersonnes !== undefined) data.nbPersonnes = dto.nbPersonnes;
    if (dto.dateDepart !== undefined) {
      data.dateDepart = dto.dateDepart ? new Date(dto.dateDepart) : null;
    }
    if (dto.statut !== undefined) data.statut = dto.statut;
    if (dto.pdfUrl !== undefined) data.pdfUrl = dto.pdfUrl;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.validiteJours !== undefined) data.validiteJours = dto.validiteJours;

    // Gestion du montant total et de la remise
    let montantTotal = dto.montantTotal ?? current.montantTotal;
    // Correction ici : remplacer || par ??
    let remiseType: RemiseType = (dto.remiseType as RemiseType) ?? (current.remiseType as RemiseType) ?? 'montant';
    let remiseValeur = dto.remiseValeur ?? current.remiseValeur ?? 0;
    let remiseMontant = 0;

    // Recalcul du montant total si le nombre de personnes ou le pack change
    if ((dto.nbPersonnes !== undefined || dto.packId !== undefined) && pack) {
      const nbPersonnes = dto.nbPersonnes ?? current.nbPersonnes;
      const prixPack = pack.basePrice;
      const montantBase = prixPack * nbPersonnes;
      
      if (dto.montantTotal === undefined) {
        montantTotal = montantBase;
      }
    }

    // Gestion de la remise
    if (dto.remise !== undefined && dto.remise > 0) {
      // Compatibilité ancien champ
      remiseType = 'montant';
      remiseValeur = dto.remise;
      remiseMontant = Math.min(dto.remise, montantTotal);
    } else if (dto.remiseType !== undefined || dto.remiseValeur !== undefined) {
      remiseMontant = this.calculateRemise(montantTotal, remiseType, remiseValeur);
    } else {
      remiseMontant = current.remise;
    }

    const montantFinal = this.calculateMontantFinal(montantTotal, remiseMontant);

    if (dto.montantTotal !== undefined) data.montantTotal = montantTotal;
    if (dto.remiseType !== undefined) data.remiseType = remiseType;
    if (dto.remiseValeur !== undefined) data.remiseValeur = remiseValeur;
    if (dto.remise !== undefined || dto.remiseType !== undefined || dto.remiseValeur !== undefined) {
      data.remise = remiseMontant;
    }
    data.montantFinal = montantFinal;

    return this.prisma.quote.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.quote.delete({ where: { id } });
    return { success: true };
  }

  /** Génère le PDF (buffer) — utilisé par l’admin et futur site public. */
  // Dans quotes.service.ts
async buildPdf(id: string): Promise<Uint8Array> {
  const q = await this.findOne(id);
  return buildQuotePdfBuffer({
    numero: q.numero,
    clientNom: q.clientNom,
    clientEmail: q.clientEmail,
    clientTel: q.clientTel,
    clientVille: q.clientVille,
    packTitle: q.packTitle ?? 'Pack Omra',
    nbPersonnes: q.nbPersonnes,
    dateDepart: q.dateDepart,
    montantTotal: q.montantTotal,
    remiseType: q.remiseType as string | undefined,  // Passage du type
    remiseValeur: q.remiseValeur,  // Passage de la valeur brute
    remise: q.remise,
    montantFinal: q.montantFinal,
    validiteJours: q.validiteJours,
    notes: q.notes,
  });
}

  async markPdfGenerated(id: string) {
    await this.findOne(id);
    return this.prisma.quote.update({
      where: { id },
      data: { pdfUrl: `generated:${new Date().toISOString()}` },
    });
  }

  /** Envoi email — INTISAR : branchement Resend/Nodemailer quand variables présentes. */
  async sendEmail(id: string): Promise<{ ok: boolean; message: string }> {
    const q = await this.findOne(id);
    const pdf = await this.buildPdf(id);
    const hasSmtp =
      process.env.SMTP_HOST && process.env.SMTP_FROM && process.env.SMTP_USER;
    if (!hasSmtp) {
      console.log(
        `[INTISAR — Devis] Simulation envoi à ${q.clientEmail} (${pdf.length} octets PDF)`,
      );
      await this.prisma.quote.update({
        where: { id },
        data: { statut: q.statut === 'en_attente' ? 'envoye' : q.statut },
      });
      return {
        ok: true,
        message:
          'SMTP non configuré — log console uniquement ; statut passé à « envoye » si était en attente.',
      };
    }
    return { ok: false, message: 'SMTP partiellement configuré — à finaliser.' };
  }
}