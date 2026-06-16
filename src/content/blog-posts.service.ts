import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-posts.dto';

@Injectable()
export class BlogPostsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.blogPost.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Blog post not found');
    return row;
  }

  create(dto: CreateBlogPostDto) {
    const { publishedAt, ...rest } = dto;
    return this.prisma.blogPost.create({
      data: {
        ...rest,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    await this.findOne(id);
    const { publishedAt, ...rest } = dto;
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...rest,
        ...(publishedAt !== undefined && {
          publishedAt: publishedAt ? new Date(publishedAt) : null,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.blogPost.delete({ where: { id } });
    return { success: true };
  }
}
