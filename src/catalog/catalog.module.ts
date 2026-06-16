import { Module } from '@nestjs/common';
import { ProductCategoriesController } from './product-categories.controller';
import { ProductCategoriesService } from './product-categories.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';

@Module({
  controllers: [
    ProductCategoriesController,
    ProductsController,
    StockMovementsController,
  ],
  providers: [
    ProductCategoriesService,
    ProductsService,
    StockMovementsService,
  ],
})
export class CatalogModule {}
