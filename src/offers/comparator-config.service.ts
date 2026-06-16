import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateComparatorConfigDto } from './dto/comparator-config.dto';

const DEFAULT_KEY = 'default';

const defaultFeatures: Prisma.InputJsonValue = [
  { id: '1', name: 'Prix', category: 'Tarif', isVisible: true, order: 1 },
  { id: '2', name: 'Durée', category: 'Voyage', isVisible: true, order: 2 },
  { id: '3', name: 'Hôtel', category: 'Hébergement', isVisible: true, order: 3 },
];

@Injectable()
export class ComparatorConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    let row = await this.prisma.comparatorConfig.findUnique({
      where: { key: DEFAULT_KEY },
    });
    if (!row) {
      row = await this.prisma.comparatorConfig.create({
        data: { key: DEFAULT_KEY, features: defaultFeatures },
      });
    }
    return row;
  }

  async update(dto: UpdateComparatorConfigDto, updatedBy?: string) {
    const current = await this.get();
    return this.prisma.comparatorConfig.update({
      where: { id: current.id },
      data: {
        features: dto.features as Prisma.InputJsonValue,
        updatedBy: updatedBy ?? null,
      },
    });
  }
}
