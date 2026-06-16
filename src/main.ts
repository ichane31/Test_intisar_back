import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { IncomingMessage, ServerResponse } from 'http';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

const REQUEST_BODY_LIMIT = '10mb';

function captureRawBody(
  req: IncomingMessage & { rawBody?: Buffer },
  _res: ServerResponse,
  buffer: Buffer,
  _encoding: string,
) {
  req.rawBody = buffer;
}

async function bootstrap() {
  const paymentPlatformEnabled =
    process.env.PAYMENT_PLATFORM_ENABLED === 'true';
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(
    json({
      limit: REQUEST_BODY_LIMIT,
      verify: captureRawBody,
    }),
  );
  app.use(urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));

  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const corsOrigins = process.env.CORS_ORIGINS?.trim();
  const corsAllowlist = corsOrigins
    ? corsOrigins.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  if (nodeEnv === 'production' && corsAllowlist.length === 0) {
    throw new Error(
      'CORS_ORIGINS must be set to a comma-separated allowlist in production',
    );
  }

  // En dev, tout reflet d’origine (localhost, 127.0.0.1, IP LAN, ports variables) pour éviter
  // les échecs « Failed to fetch » si l’utilisateur ouvre Next via l’URL réseau (ex. 192.168.x.x).
  const corsOriginOption =
    nodeEnv === 'production' ? corsAllowlist : true;

  app.enableCors({
    origin: corsOriginOption,
    credentials: true,
  });

  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const enableSwagger =
    nodeEnv !== 'production' || process.env.SWAGGER_ENABLE === 'true';
  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('INTISAR Admin API')
      .setDescription(
        'API admin alignée docs/07–08 — authentification JWT, RBAC par permissions, modèle canonique OmraPack / documents / CRM.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
}
void bootstrap();
