import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { Permissions } from "../auth/permissions.decorator";
import {
  CreateCustomOfferDto,
  UpdateCustomOfferDto,
} from './dto/custom-offer.dto';
import { CustomOffersService } from './custom-offers.service';

@Permissions('manage_offers')
@Controller('custom-offers')
export class CustomOffersController {
  constructor(private readonly service: CustomOffersService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCustomOfferDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomOfferDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
