import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { CurrentUser, type JwtUser } from '../common/current-user.decorator';
import {
  PatchComparateurMatrixConfigDto,
  ReplaceComparateurMatrixConfigDto,
} from './dto/comparateur-matrix-config.dto';
import { ComparateurMatrixConfigService } from './comparateur-matrix-config.service';

@Permissions('manage_offers')
@Controller('admin/comparateur-config')
export class ComparateurMatrixConfigController {
  constructor(private readonly service: ComparateurMatrixConfigService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Post()
  post(
    @Body() dto: ReplaceComparateurMatrixConfigDto,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.service.replace(dto, user?.id);
  }

  @Patch()
  patch(
    @Body() dto: PatchComparateurMatrixConfigDto,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.service.merge(dto, user?.id);
  }
}
