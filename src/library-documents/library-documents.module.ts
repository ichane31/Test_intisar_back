import { Module } from '@nestjs/common';
import { LibraryDocumentsController } from './library-documents.controller';
import { LibraryDocumentsService } from './library-documents.service';

@Module({
  controllers: [LibraryDocumentsController],
  providers: [LibraryDocumentsService],
  exports: [LibraryDocumentsService],
})
export class LibraryDocumentsModule {}
