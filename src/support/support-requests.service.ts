// support-requests.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  createdAtBounds,
  listMeta,
  normalizePagination,
} from '../common/pagination.util';
import { assertRequestStatusTransition } from '../common/status-transitions';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../services/email.service';
import type {
  CreateSupportRequestDto,
  UpdateSupportRequestDto,
} from './dto/support-request.dto';
import type { SupportRequestListQueryDto } from './dto/support-request-list-query.dto';

@Injectable()
export class SupportRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  async findAll(query: SupportRequestListQueryDto) {
    const where: Prisma.SupportRequestWhereInput = {};

    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    if (query.search) {
      const q = query.search;
      where.OR = [
        { clientName: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
        { clientEmail: { contains: q, mode: 'insensitive' } },
        { clientPhone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const bounds = createdAtBounds(query.createdFrom, query.createdTo);
    if (bounds) where.createdAt = bounds;

    const orderBy = { createdAt: 'desc' as const };
    const { page, limit, skip } = normalizePagination(query.page, query.limit);

    const [total, data] = await Promise.all([
      this.prisma.supportRequest.count({ where }),
      this.prisma.supportRequest.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return { data, meta: listMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const row = await this.prisma.supportRequest.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Request not found');
    return row;
  }

  async create(dto: CreateSupportRequestDto) {
    // Enregistrer en base de données
    const request = await this.prisma.supportRequest.create({
      data: {
        type: dto.type,
        clientName: dto.clientName,
        clientEmail: dto.clientEmail,
        clientPhone: dto.clientPhone,
        subject: dto.subject,
        message: dto.message,
        status: dto.status,
        assignedTo: dto.assignedTo,
        response: dto.response,
      },
    });

    // Envoyer les emails uniquement pour les demandes de type 'form' ou 'inscription'
    if (dto.type === 'form' || dto.type === 'inscription') {
      try {
        await this.emailService.sendContactNotification({
          name: dto.clientName,
          email: dto.clientEmail,
          phone: dto.clientPhone || '',
          subject: dto.subject,
          message: dto.message,
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi d'email:", error);
        // Ne pas bloquer la création si l'email échoue
      }
    }

    return request;
  }

  async update(id: string, dto: UpdateSupportRequestDto) {
    const existing = await this.findOne(id);
    const { status, ...rest } = dto;

    if (status !== undefined && status !== existing.status) {
      assertRequestStatusTransition(existing.status, status);
    }

    return this.prisma.supportRequest.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined && { status }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.supportRequest.delete({ where: { id } });
    return { success: true };
  }

  async sendReplyEmail(requestId: string, reply: string) {
    const request = await this.findOne(requestId);

    if (!request.clientEmail) {
      throw new BadRequestException("Ce client n'a pas d'adresse email");
    }

    // Envoyer l'email
    await this.emailService.sendSupportReply({
      to: request.clientEmail,
      clientName: request.clientName,
      subject: request.subject,
      reply: reply,
      requestId: request.id,
    });

    // Mettre à jour la demande avec la réponse
    return this.prisma.supportRequest.update({
      where: { id: requestId },
      data: {
        response: reply,
        status: 'completed',
      },
    });
  }
}
