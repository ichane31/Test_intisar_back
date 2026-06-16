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
import { OmraReservationListQueryDto } from './dto/omra-reservation-list-query.dto';
import {
  CreateOmraReservationDto,
  UpdateOmraReservationDto,
} from './dto/omra-reservation.dto';
import { OmraReservationsService } from './omra-reservations.service';

@Permissions('manage_orders')
@Controller('omra-reservations')
export class OmraReservationsController {
  constructor(private readonly service: OmraReservationsService) {}

  @Get()
  list(@Query() query: OmraReservationListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOmraReservationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOmraReservationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
