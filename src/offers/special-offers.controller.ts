import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import {
  CreateSpecialOfferDto,
  UpdateSpecialOfferDto,
} from './dto/special-offer.dto';
import { SpecialOffersService } from './special-offers.service';

@Permissions('manage_offers')
@Controller('special-offers')
export class SpecialOffersController {
  constructor(private readonly service: SpecialOffersService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSpecialOfferDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSpecialOfferDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
