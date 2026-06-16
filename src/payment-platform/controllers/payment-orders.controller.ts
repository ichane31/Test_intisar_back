import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { JwtUser } from '../../common/current-user.decorator';
import { CurrentUser } from '../../common/current-user.decorator';
import { CreatePaymentOrderDto } from '../dto/create-order.dto';
import { PaymentOrdersService } from '../services/payment-orders.service';

@ApiTags('payment-platform')
@Controller('orders')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PaymentOrdersController {
  constructor(private readonly orders: PaymentOrdersService) {}

  @Post()
  create(
    @Body() dto: CreatePaymentOrderDto,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    return this.orders.create(dto, user?.id);
  }

  @Get()
  list(@Query('take') take?: string) {
    const n = take ? Number.parseInt(take, 10) : 50;
    return this.orders.findMany(Number.isFinite(n) ? n : 50);
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.orders.findOne(id);
  }
}
