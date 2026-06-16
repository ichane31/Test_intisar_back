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
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { ClientListQueryDto } from './dto/client-list-query.dto';
import { ClientsService } from './clients.service';

@Permissions('manage_clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Get()
  list(@Query() query: ClientListQueryDto) {
    return this.service.findAll(query);
  }


  @Get('complets')
  findAllComplets(@Query() query: ClientListQueryDto) {
    return this.service.findAllComplets(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('complet/:id')
  findOneComplet(@Param('id') id: string) {
    return this.service.findOneComplet(id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.service.getClientStats(id);
  }

  @Get(':id/history')
  getOrderHistory(@Param('id') id: string) {
    return this.service.getClientOrderHistory(id);
  }

  @Get('top/spenders')
  getTopClients(@Query('limit') limit?: string) {
    return this.service.getTopClients(limit ? parseInt(limit) : 10);
  }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
