import { Body, Controller, Get, Post } from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import { CreateStockMovementDto } from './dto/stock.dto';
import { StockMovementsService } from './stock-movements.service';

@Permissions('manage_shop')
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly service: StockMovementsService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateStockMovementDto) {
    return this.service.create(dto);
  }
}
