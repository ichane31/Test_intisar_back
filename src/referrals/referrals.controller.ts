import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { Public } from '../common/public.decorator';
import {
  GenerateReferralDto,
  PatchReferralDto,
  ValidateReferralCodeDto,
  UseReferralCodeDto,
  ActivateRewardDto,
  ReferralQueryDto,
  ReferralStatsQueryDto,
} from './dto/referral.dto';
import { ReferralsService } from './referrals.service';

@Permissions('manage_clients')
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly service: ReferralsService) {}

  // Liste tous les parrainages avec filtres et pagination
  @Get()
  findAll(@Query() query: ReferralQueryDto) {
    return this.service.findAll(query);
  }

  // Récupérer un parrainage spécifique
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Parrainages d'un client (comme parrain)
  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string) {
    return this.service.findByClient(clientId);
  }

  // Parrainages où un client est filleul
  @Get('filleul/:filleulId')
  findByFilleul(@Param('filleulId') filleulId: string) {
    return this.service.findByFilleul(filleulId);
  }

  // Générer un code de parrainage (admin)
  @Post('generate')
  generate(@Body() dto: GenerateReferralDto) {
    return this.service.generate(dto);
  }

  // Générer un code pour un client spécifique (admin)
  @Post('generate/:clientId')
  generateForClient(@Param('clientId') clientId: string) {
    return this.service.generate({ clientId });
  }

  // PUBLIC - Valider un code (sans créer de lien)
  @Public()
  @Post('validate')
  validate(@Body() dto: ValidateReferralCodeDto) {
    return this.service.validateCode(dto);
  }

  // PUBLIC - Utiliser un code (créer le lien filleul)
  @Public()
  @Post('use')
  useCode(@Body() dto: UseReferralCodeDto) {
    return this.service.useCode(dto);
  }

  // Attacher une réservation à un parrainage existant
  @Post(':id/attach-reservation')
  attachReservation(
    @Param('id') id: string,
    @Body() body: { reservationId: string; reservationMontant?: number }
  ) {
    return this.service.attachReservation(
      id,
      body.reservationId,
      body.reservationMontant
    );
  }

  // Activer une récompense (admin)
  @Patch(':id/activate')
  activateReward(@Param('id') id: string, @Body() dto?: ActivateRewardDto) {
    return this.service.activateReward(id, dto);
  }

  // Mettre à jour un parrainage (admin)
  @Patch(':id')
  patch(@Param('id') id: string, @Body() dto: PatchReferralDto) {
    return this.service.patch(id, dto);
  }

  // Statistiques des parrainages
  @Get('stats/overview')
  getStats(@Query() query: ReferralStatsQueryDto) {
    return this.service.getStats(query);
  }

  // Expirer les codes obsolètes (admin)
  @Post('expire-old')
  @HttpCode(HttpStatus.OK)
  expireOldCodes() {
    return this.service.expireOldCodes();
  }

  // referrals.controller.ts - Ajouter cette méthode

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteReferral(@Param('id') id: string) {
    return this.service.deleteReferral(id);
  }
}
