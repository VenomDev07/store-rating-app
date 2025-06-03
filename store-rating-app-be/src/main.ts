import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);

  // Form data parsing middleware
  app.use(express.json({ limit: '10mb' })); // For JSON data
  app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For URL-encoded form data
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // CORS configuration
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Global prefix
  app.setGlobalPrefix(configService.get('apiPrefix'));
  
  // Security headers
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
  });
  
  const port = configService.get('port');
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/${configService.get('apiPrefix')}`);
  console.log(`📊 Environment: ${configService.get('nodeEnv')}`);
}

bootstrap();