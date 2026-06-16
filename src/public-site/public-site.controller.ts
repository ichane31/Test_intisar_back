import {
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { ComparateurMatrixConfigService } from '../comparateur-admin/comparateur-matrix-config.service';
import { OmraPacksService } from '../offers/omra-packs.service';
import { OmraSurMesureConfigService } from '../offers/omra-sur-mesure-config.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Lecture seule pour le site officiel — pas de JWT.
 */
@Controller('public')
export class PublicSiteController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly comparateurMatrixService: ComparateurMatrixConfigService,
    private readonly omraPacksService: OmraPacksService,
    private readonly omraSurMesure: OmraSurMesureConfigService,
  ) {}

  @Public()
  @Get('offres')
  async listPublishedOffers() {
    return this.omraPacksService.publishedForPublic();
  }

  @Public()
  @Get('offres/departures')
  async upcomingDepartures() {
    return this.omraPacksService.upcomingDeparturePeriods();
  }

  @Public()
  @Get('offres/:slug')
  async getPublishedOfferBySlug(@Param('slug') slug: string) {
    return this.omraPacksService.publishedOneBySlug(slug);
  }

  @Public()
  @Get('offres/id/:id')
  async getPublishedOfferById(@Param('id') id: string) {
    return this.omraPacksService.publishedOneById(id);
  }

  @Public()
  @Get('comparateur-matrix')
  async getComparateurMatrix() {
    const row = await this.comparateurMatrixService.get();
    return { payload: row.payload };
  }

  @Public()
  @Get('omra-sur-mesure-config')
  async getOmraSurMesureConfig() {
    const row = await this.omraSurMesure.get();
    return { payload: row.payload };
  }

  @Public()
  @Get('faqs')
  async faqsPublished() {
    return this.prisma.faq.findMany({
      where: { status: 'published' },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        order: true,
      },
    });
  }

  @Public()
  @Get('blog')
  async blogPublishedList() {
    return this.prisma.blogPost.findMany({
      where: { status: 'published' },
      orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        author: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  @Public()
  @Get('blog/:slug')
  async blogPublishedOne(@Param('slug') slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: 'published' },
    });
    if (!post) throw new NotFoundException();
    return post;
  }

  @Public()
  @Get('guides')
  async guidesPublishedList() {
    return this.prisma.guide.findMany({
      where: { status: 'published' },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        images: true,
        updatedAt: true,
        createdAt: true,
      },
    });
  }

  @Public()
  @Get('guides/:slug')
  async guidePublishedOne(@Param('slug') slug: string) {
    const row = await this.prisma.guide.findFirst({
      where: { slug, status: 'published' },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  @Public()
  @Get('testimonials')
  async testimonialsPublished() {
    return this.prisma.testimonial.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 24,
      select: {
        id: true,
        clientName: true,
        clientPhoto: true,
        tripType: true,
        rating: true,
        content: true,
        createdAt: true,
      },
    });
  }

  @Public()
  @Get('homepage')
  async homepagePatch() {
    const row = await this.prisma.homepagePublicConfig.findUnique({
      where: { key: 'default' },
    });
    return {
      payload:
        row?.payload && typeof row.payload === 'object' && row.payload !== null
          ? row.payload
          : {},
    };
  }
}
