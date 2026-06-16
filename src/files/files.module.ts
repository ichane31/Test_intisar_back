import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { MediaFilesController } from './media-files.controller';
import { MediaFilesService } from './media-files.service';

@Module({
  controllers: [MediaFilesController, DocumentsController],
  providers: [MediaFilesService, DocumentsService],
})
export class FilesModule {}
