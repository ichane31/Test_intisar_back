import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { CreateHistoryEntryDto } from './dto/history.dto';
import { HistoryService } from './history.service';

@Permissions('view_history')
@Controller('history')
export class HistoryController {
  constructor(private readonly service: HistoryService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateHistoryEntryDto) {
    return this.service.create(dto);
  }
}
