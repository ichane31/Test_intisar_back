// support-requests.module.ts
import { Module } from '@nestjs/common';
import { SupportRequestsService } from './support-requests.service';
import { SupportRequestsController } from './support-requests.controller';
import { EmailService } from '../services/email.service';

@Module({
  controllers: [SupportRequestsController],
  providers: [SupportRequestsService, EmailService],
  exports: [SupportRequestsService],
})
export class SupportModule {}