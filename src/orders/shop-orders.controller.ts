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
import { CreateShopOrderDto, UpdateShopOrderDto } from './dto/shop-order.dto';
import { ShopOrderListQueryDto } from './dto/shop-order-list-query.dto';
import { ShopOrdersService } from './shop-orders.service';

@Permissions('manage_orders')
@Controller('shop-orders')
export class ShopOrdersController {
  constructor(private readonly service: ShopOrdersService) {}

  @Get()
  list(@Query() query: ShopOrderListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateShopOrderDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShopOrderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
