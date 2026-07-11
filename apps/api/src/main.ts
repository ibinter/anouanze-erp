import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Sécurité
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3099', configService.get<string>('APP_URL', 'http://localhost:3000')],
    credentials: true,
  });

  // Pas de global prefix — les controllers ont déjà 'api/v1/...' dans leur chemin

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Documentation Swagger (dev uniquement)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ANOUANZÊ ERP API')
      .setDescription("API REST de l'ERP pour associations, ONG et OSBL")
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentification et gestion des sessions')
      .addTag('organisations', 'Gestion des organisations')
      .addTag('membres', 'Gestion des membres et adhésions')
      .addTag('projets', 'Gestion des projets et programmes')
      .addTag('comptabilite', 'Comptabilité SYCEBNL')
      .addTag('rh', 'Ressources humaines et volontaires')
      .addTag('documents', 'Gestion électronique de documents')
      .addTag('reporting', 'Rapports et Business Intelligence')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
  console.log(`\n🚀 ANOUANZÊ ERP API démarrée sur http://localhost:${port}/api`);
  console.log(`📚 Documentation : http://localhost:${port}/api/docs\n`);
}

bootstrap();
