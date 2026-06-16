import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { SystemLogsController } from './system-logs.controller';
import { SystemLogsService } from './system-logs.service';

@Module({
  controllers: [HistoryController, SystemLogsController],
  providers: [HistoryService, SystemLogsService],
})
export class AuditModule {}
