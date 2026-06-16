import { Module } from '@nestjs/common';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsService } from './blog-posts.service';
import { FaqsController } from './faqs.controller';
import { FaqsService } from './faqs.service';
import { GuidesController } from './guides.controller';
import { GuidesService } from './guides.service';
import { LegalContentController } from './legal-content.controller';
import { LegalContentService } from './legal-content.service';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';

@Module({
  controllers: [
    PagesController,
    SectionsController,
    FaqsController,
    BlogPostsController,
    GuidesController,
    LegalContentController,
    TestimonialsController,
  ],
  providers: [
    PagesService,
    SectionsService,
    FaqsService,
    BlogPostsService,
    GuidesService,
    LegalContentService,
    TestimonialsService,
  ],
})
export class ContentModule {}
