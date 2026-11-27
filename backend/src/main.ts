import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TrimStringsPipe } from './common/pipes/trim-strings.pipe';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Global API Prefix: http://localhost:5000/api
  app.setGlobalPrefix('api');

  // 2. Enable Graceful Shutdown (Handles Docker/Render SIGTERM signals)
  app.enableShutdownHooks();

  // 3. Helmet: Security HTTP headers
  app.use(helmet());

  // 3. CORS: Whitelist Next.js frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // 4. Global Error Filter: Clean, standardized error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // 5. Global Interceptors: Request speed logging & standardized response envelope
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // 6. Global Pipes: Automatic whitespace trimming & validation
  app.useGlobalPipes(
    new TrimStringsPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // 7. Swagger Documentation: http://localhost:5000/api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wedding Gift Registration API')
    .setDescription(
      'Enterprise REST API documentation for Wedding Gift Registration System',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`🚀 NestJS Backend running at: http://localhost:${port}/api`);
  logger.log(`📚 Swagger API Docs available at: http://localhost:${port}/api/docs`);
}

void bootstrap();
