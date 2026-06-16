import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import {
  CreateLibraryDocumentDto,
  UpdateLibraryDocumentDto,
} from './dto/library-document.dto';
import { LibraryDocumentsService } from './library-documents.service';

@Permissions('manage_documents')
@Controller('library-documents')
export class LibraryDocumentsController {
  constructor(private readonly service: LibraryDocumentsService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLibraryDocumentDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLibraryDocumentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
