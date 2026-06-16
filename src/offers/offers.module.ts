import { Module } from '@nestjs/common';
import { ComparatorConfigController } from './comparator-config.controller';
import { ComparatorConfigService } from './comparator-config.service';
import { CustomOffersController } from './custom-offers.controller';
import { CustomOffersService } from './custom-offers.service';
import { OmraSurMesureConfigController } from './omra-sur-mesure-config.controller';
import { OmraSurMesureConfigService } from './omra-sur-mesure-config.service';
import { OmraPacksController } from './omra-packs.controller';
import { OmraPacksService } from './omra-packs.service';
import { SpecialOffersController } from './special-offers.controller';
import { SpecialOffersService } from './special-offers.service';

@Module({
  controllers: [
    OmraPacksController,
    SpecialOffersController,
    CustomOffersController,
    ComparatorConfigController,
    OmraSurMesureConfigController,
  ],
  providers: [
    OmraPacksService,
    SpecialOffersService,
    CustomOffersService,
    ComparatorConfigService,
    OmraSurMesureConfigService,
  ],
  exports: [OmraPacksService, OmraSurMesureConfigService],
})
export class OffersModule {}
