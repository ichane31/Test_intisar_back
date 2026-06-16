import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { CurrentUser, type JwtUser } from '../common/current-user.decorator';
import { UpdateComparatorConfigDto } from './dto/comparator-config.dto';
import { ComparatorConfigService } from './comparator-config.service';

@Permissions('manage_offers')
@Controller('comparator-config')
export class ComparatorConfigController {
  constructor(private readonly service: ComparatorConfigService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Patch()
  update(
    @Body() dto: UpdateComparatorConfigDto,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.service.update(dto, user?.id);
  }
}
