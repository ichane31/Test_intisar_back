import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { UpdateGlobalSettingsDto } from './dto/global-settings.dto';
import { SettingsService } from './settings.service';

@Permissions('manage_settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get('global')
  getGlobal() {
    return this.service.getGlobal();
  }

  @Patch('global')
  updateGlobal(@Body() dto: UpdateGlobalSettingsDto) {
    return this.service.updateGlobal(dto);
  }
}
