import {
  Controller,
  Get,
  Param,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { PaymentInvoicesService } from '../services/payment-invoices.service';

@ApiTags('payment-platform')
@Controller('invoices')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PaymentInvoicesController {
  constructor(private readonly invoices: PaymentInvoicesService) {}

  @Get('order/:orderId')
  byOrder(@Param('orderId') orderId: string) {
    return this.invoices.findByOrder(orderId);
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.invoices.findOne(id);
  }

  @Get(':id/pdf')
  async pdf(@Param('id') id: string, @Res() res: Response) {
    const buf = await this.invoices.getPdfBuffer(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="intisar-invoice-${id}.pdf"`,
    );
    res.send(Buffer.from(buf));
  }
}
