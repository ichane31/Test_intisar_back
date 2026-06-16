import { Module } from '@nestjs/common';
import { ComparateurAdminModule } from '../comparateur-admin/comparateur-admin.module';
import { OffersModule } from '../offers/offers.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicSiteController } from './public-site.controller';

@Module({
  imports: [PrismaModule, ComparateurAdminModule, OffersModule],
  controllers: [PublicSiteController],
})
export class PublicSiteModule {}
