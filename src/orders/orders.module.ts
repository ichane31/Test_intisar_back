import { Module } from '@nestjs/common';
import { OmraReservationsController } from './omra-reservations.controller';
import { OmraReservationsService } from './omra-reservations.service';
import { ShopOrdersController } from './shop-orders.controller';
import { ShopOrdersService } from './shop-orders.service';

@Module({
  controllers: [ShopOrdersController, OmraReservationsController],
  providers: [ShopOrdersService, OmraReservationsService],
})
export class OrdersModule {}
