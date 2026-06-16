import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { CreateSystemLogDto } from './dto/system-log.dto';
import { SystemLogsService } from './system-logs.service';

@Permissions('view_logs')
@Controller('system-logs')
export class SystemLogsController {
  constructor(private readonly service: SystemLogsService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSystemLogDto) {
    return this.service.create(dto);
  }
}
