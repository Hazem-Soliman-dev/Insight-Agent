import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  // Enable graceful shutdown hooks to ensure Node receives and handles SIGTERM from Railway properly
  app.enableShutdownHooks();

  // Trust proxy for correct rate limiting IP detection behind reverse proxies (like Railway)
  app.set('trust proxy', 1);

  // Security: Helmet for HTTP headers
  app.use(helmet());

  // Security: Rate limiting (100 requests per 15 minutes per IP)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        statusCode: 429,
        message: 'Too many requests, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
      // Skip rate limiting for health check endpoint to prevent Railway health check failures
      skip: (req) => req.path === '/api/health' || req.originalUrl === '/api/health',
    }),
  );

  // Performance: Compression
  app.use(compression());

  // Security: CORS with environment-based origins
  const allowedOrigins =
    process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [];
  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server, health check probes)
      if (!origin) {
        callback(null, true);
        return;
      }
      // Allow all origins if ALLOWED_ORIGINS contains '*'
      if (allowedOrigins.includes('*')) {
        callback(null, true);
        return;
      }
      // Check if origin is in the allowed list
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      // In development, allow localhost
      if (!isProduction && origin && origin.includes('localhost')) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe with security settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: isProduction, // Hide detailed errors in production
    }),
  );

  // API prefix (exclude root path to handle e2e tests and custom/default Railway health check probes)
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 InsightAgent API running on http://localhost:${port}/api`);
  logger.log(`🔒 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  logger.log(
    `🌐 Allowed Origins: ${allowedOrigins.join(', ') || 'localhost (dev mode)'}`,
  );
}
void bootstrap();
