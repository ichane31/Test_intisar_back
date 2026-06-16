import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateGlobalSettingsDto } from './dto/global-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobal() {
    let row = await this.prisma.globalSettings.findFirst();
    if (!row) {
      row = await this.prisma.globalSettings.create({
        data: {
          siteName: 'INTISAR',
          siteEmail: 'contact@intisar.com',
          sitePhone: '+212 000 000 000',
          currency: 'MAD',
          timezone: 'Africa/Casablanca',
          maintenanceMode: false,
          siteDescription: null,
          companyAddress: null,
          defaultLanguage: 'fr',
        },
      });
    }
    return row;
  }

  async updateGlobal(dto: UpdateGlobalSettingsDto) {
    const current = await this.getGlobal();
    return this.prisma.globalSettings.update({
      where: { id: current.id },
      data: dto,
    });
  }
}
