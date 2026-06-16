import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateMediaFileDto, UpdateMediaFileDto } from './dto/media-file.dto';

@Injectable()
export class MediaFilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.mediaFile.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Media file not found');
    return row;
  }

  create(dto: CreateMediaFileDto) {
    return this.prisma.mediaFile.create({ data: dto });
  }

  async update(id: string, dto: UpdateMediaFileDto) {
    await this.findOne(id);
    return this.prisma.mediaFile.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.mediaFile.delete({ where: { id } });
    return { success: true };
  }
}
