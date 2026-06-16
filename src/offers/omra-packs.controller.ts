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
import { CreateOmraPackDto, UpdateOmraPackDto } from './dto/omra-pack.dto';
import { OmraPackListQueryDto } from './dto/omra-pack-list-query.dto';
import { OmraPacksService } from './omra-packs.service';

@Permissions('manage_offers')
@Controller('omra-packs')
export class OmraPacksController {
  constructor(private readonly service: OmraPacksService) {}

  @Get()
  list(@Query() query: OmraPackListQueryDto) {
    return this.service.findAll(
      {
        status: query.status,
        tripType: query.tripType,
        search: query.search,
        createdFrom: query.createdFrom,
        createdTo: query.createdTo,
      },
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOmraPackDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOmraPackDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
