import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permissions } from '../auth/permissions.decorator';
import {
  CreateSupportRequestDto,
  UpdateSupportRequestDto,
} from './dto/support-request.dto';
import { SupportRequestListQueryDto } from './dto/support-request-list-query.dto';
import { SupportRequestsService } from './support-requests.service';

@Permissions('manage_requests')
@Controller('requests')
export class SupportRequestsController {
  constructor(private readonly service: SupportRequestsService) {}

  @Get()
  list(@Query() query: SupportRequestListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSupportRequestDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupportRequestDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/reply')
  async replyToRequest(
    @Param('id') id: string,
    @Body() body: { reply: string }
  ) {
    return this.service.sendReplyEmail(id, body.reply);
  }
}
