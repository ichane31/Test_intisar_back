import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Permissions } from '../auth/permissions.decorator';
import { Public } from '../common/public.decorator';
import { CreateQuoteDto, UpdateQuoteDto } from './dto/quote.dto';
import { QuotesService } from './quotes.service';

@Permissions('manage_offers')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly service: QuotesService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  /** // PUBLIC-API — consultation devis (token / auth à renforcer pour le site public) */
  @Public()
  @Get('public/:id')
  async getPublic(@Param('id') id: string) {
    const q = await this.service.findOne(id);
    if (!['envoye', 'accepte'].includes(q.statut)) {
      return { error: 'Devis non disponible' };
    }
    return {
      numero: q.numero,
      clientNom: q.clientNom,
      montantFinal: q.montantFinal,
      statut: q.statut,
      validiteJours: q.validiteJours,
      createdAt: q.createdAt,
    };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateQuoteDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuoteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/generate')
  @Header('Content-Type', 'application/pdf')
  async generate(
    @Param('id') id: string,
    @Res({ passthrough: false }) res: Response,
  ) {
    const buf = await this.service.buildPdf(id);
    await this.service.markPdfGenerated(id);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="devis-${id}.pdf"`,
    );
    res.send(Buffer.from(buf));
  }

  @Post(':id/send')
  send(@Param('id') id: string) {
    return this.service.sendEmail(id);
  }
}
