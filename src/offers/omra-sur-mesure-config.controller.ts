import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { CurrentUser, type JwtUser } from '../common/current-user.decorator';
import {
  PatchOmraSurMesureConfigDto,
  ReplaceOmraSurMesureConfigDto,
} from './dto/omra-sur-mesure-config.dto';
import { OmraSurMesureConfigService } from './omra-sur-mesure-config.service';

@Permissions('manage_offers')
@Controller('admin/omra-config')
export class OmraSurMesureConfigController {
  constructor(private readonly service: OmraSurMesureConfigService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Post()
  post(
    @Body() dto: ReplaceOmraSurMesureConfigDto,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.service.replace(dto, user?.id);
  }

  @Patch()
  patch(
    @Body() dto: PatchOmraSurMesureConfigDto,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.service.merge(dto, user?.id);
  }
}
