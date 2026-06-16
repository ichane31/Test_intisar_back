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
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-posts.dto';
import { BlogPostsService } from './blog-posts.service';

@Permissions('manage_content')
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly service: BlogPostsService) {}

  @Get()
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBlogPostDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
