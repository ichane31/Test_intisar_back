import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { LeadListQueryDto } from './dto/lead-list-query.dto';
import { LeadsService } from './leads.service';

@Permissions('manage_clients')
@Controller('leads')
export class LeadsController {
  constructor(private readonly service: LeadsService) {}

  @Get()
  list(@Query() query: LeadListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
