import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  controllers: [ClientsController, LeadsController],
  providers: [ClientsService, LeadsService],
})
export class CrmModule {}
