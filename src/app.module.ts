import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { LibraryDocumentsModule } from './library-documents/library-documents.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { CatalogModule } from './catalog/catalog.module';
import { ContentModule } from './content/content.module';
import { CrmModule } from './crm/crm.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FilesModule } from './files/files.module';
import { HealthModule } from './health/health.module';
import { OffersModule } from './offers/offers.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { SupportModule } from './support/support.module';
import { QuotesModule } from './quotes/quotes.module';
import { ReferralsModule } from './referrals/referrals.module';
import { PaymentPlatformModule } from './payment-platform/payment-platform.module';
import { ComparateurAdminModule } from './comparateur-admin/comparateur-admin.module';
import { PublicSiteModule } from './public-site/public-site.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60000, limit: 120 }],
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    OffersModule,
    CatalogModule,
    OrdersModule,
    CrmModule,
    SupportModule,
    FilesModule,
    AuditModule,
    ContentModule,
    DashboardModule,
    SettingsModule,
    AdminUsersModule,
    LibraryDocumentsModule,
    QuotesModule,
    ReferralsModule,
    PaymentPlatformModule.register(),
    ComparateurAdminModule,
    PublicSiteModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
