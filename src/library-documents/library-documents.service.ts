import { Injectable, NotFoundException } from '@nestjs/common';
import { assertLibraryDocumentStatusTransition } from '../common/status-transitions';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateLibraryDocumentDto,
  UpdateLibraryDocumentDto,
} from './dto/library-document.dto';

@Injectable()
export class LibraryDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.libraryDocument.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.libraryDocument.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Library document not found');
    return row;
  }

  create(dto: CreateLibraryDocumentDto) {
    return this.prisma.libraryDocument.create({ data: dto });
  }

  async update(id: string, dto: UpdateLibraryDocumentDto) {
    const existing = await this.findOne(id);
    const { status, ...rest } = dto;
    if (status !== undefined && status !== existing.status) {
      assertLibraryDocumentStatusTransition(existing.status, status);
    }
    return this.prisma.libraryDocument.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined && { status }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.libraryDocument.delete({ where: { id } });
    return { success: true };
  }
}
