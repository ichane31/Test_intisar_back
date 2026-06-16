import { Controller, Get } from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { DashboardService } from './dashboard.service';

@Permissions('view_dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  stats() {
    return this.service.getStats();
  }
}
