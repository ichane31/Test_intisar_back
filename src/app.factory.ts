import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

export async function createConfiguredApp() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const paymentPlatformEnabled = process.env.PAYMENT_PLATFORM_ENABLED === 'true';

  const app = await NestFactory.create(AppModule, {
    rawBody: paymentPlatformEnabled,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CORS CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────────
  // 
  // 🧪 MODE TEST ACTIF - CORS complètement ouvert
  // 
  // Pour revenir à la version sécurisée (production) :
  // 1. Décommentez la section "Configuration sécurisée pour la production" ci-dessous
  // 2. Commentez la section "Configuration temporaire pour les tests"
  // 3. Ajoutez la variable d'environnement CORS_ORIGINS dans Vercel
  //    Exemple: https://mon-frontend.vercel.app,https://domaine.com
  // ─────────────────────────────────────────────────────────────────────────────

  // ============================================================================
  // SECTION TEMPORAIRE POUR LES TESTS (ACTUELLEMENT ACTIVE)
  // ============================================================================
  // Autorise toutes les origines - Idéal pour le développement et les tests
  // Ne PAS utiliser en production car cela permet à n'importe quel site
  // d'appeler votre API
  // ============================================================================
  app.enableCors({
    origin: true,           
    credentials: true,
    methods: [
      'GET', 
      'POST', 
      'PUT', 
      'DELETE', 
      'PATCH', 
      'OPTIONS' 
    ],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept',
      'X-Requested-With'
    ],
    preflightContinue: false,  
    optionsSuccessStatus: 204,
  });

  // ============================================================================
  // CONFIGURATION SÉCURISÉE POUR LA PRODUCTION (COMMENTÉE POUR L'INSTANT)
  // ============================================================================
  // Décommentez cette section et commentez celle du dessus quand vous serez
  // prêt pour la production
  // ============================================================================
  
  // const corsOrigins = process.env.CORS_ORIGINS?.trim();
  // const corsAllowlist = corsOrigins
  //   ? corsOrigins.split(',').map((o) => o.trim()).filter(Boolean)
  //   : [];
  // 
  // // Vérification stricte pour la production
  // if (nodeEnv === 'production' && corsAllowlist.length === 0) {
  //   throw new Error(
  //     'CORS_ORIGINS must be set to a comma-separated allowlist in production.\n' +
  //     'Example: CORS_ORIGINS=https://frontend.com,https://admin.frontend.com'
  //   );
  // }
  // 
  // app.enableCors({
  //   // En dev: autorise tout, en prod: uniquement la liste blanche
  //   origin: nodeEnv === 'production' ? corsAllowlist : true,
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  // });
  
  // Fin de la configuration CORS
  // ─────────────────────────────────────────────────────────────────────────────

  // ── Configuration globale de l'API ──────────────────────────────────────────
  // Toutes les routes seront préfixées par /api sauf /health
  app.setGlobalPrefix('api', { exclude: ['health'] });

  // Configuration des validations globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,                   // Supprime les propriétés non définies dans les DTO
      forbidNonWhitelisted: true,        // Bloque les requêtes avec des propriétés non autorisées
      transform: true,                   // Transforme automatiquement les types
      transformOptions: { 
        enableImplicitConversion: true   // Convertit implicitement les types (ex: string -> number)
      },
    }),
  );

  // ── Documentation Swagger (API Explorer) ────────────────────────────────────
  // Swagger est disponible en développement ou si explicitement activé en prod
  const enableSwagger =
    nodeEnv !== 'production' || process.env.SWAGGER_ENABLE === 'true';

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('INTISAR Admin API')
      .setDescription(
        'API admin alignée docs/07–08 — authentification JWT, RBAC par permissions, ' +
        'modèle canonique OmraPack / documents / CRM.'
      )
      .setVersion('1.0')
      .addBearerAuth()  // Ajoute l'authentification JWT dans Swagger
      .build();

    // Génère et configure la documentation Swagger sur la route /docs
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  }

  return app;
}