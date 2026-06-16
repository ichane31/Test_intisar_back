import { Injectable, NotFoundException } from '@nestjs/common';
import { assertOperationalDocumentStatusTransition } from '../common/status-transitions';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.document.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.document.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Document not found');
    return row;
  }

  create(dto: CreateDocumentDto) {
    return this.prisma.document.create({ data: dto });
  }

  async update(id: string, dto: UpdateDocumentDto) {
    const existing = await this.findOne(id);
    const { status, ...rest } = dto;
    if (status !== undefined && status !== existing.status) {
      assertOperationalDocumentStatusTransition(existing.status, status);
    }
    return this.prisma.document.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined && { status }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.document.delete({ where: { id } });
    return { success: true };
  }
}
