import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ComparateurMatrixConfigController } from './comparateur-matrix-config.controller';
import { ComparateurMatrixConfigService } from './comparateur-matrix-config.service';

@Module({
  imports: [PrismaModule],
  controllers: [ComparateurMatrixConfigController],
  providers: [ComparateurMatrixConfigService],
  exports: [ComparateurMatrixConfigService],
})
export class ComparateurAdminModule {}
