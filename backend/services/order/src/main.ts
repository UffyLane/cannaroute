import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = app.get(ConfigService);

  const allowedOrigins = config
    .get<string>('CORS_ORIGINS', 'http://localhost:3000,http://localhost:19006')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Wire Socket.IO CORS through ConfigService (not process.env)
  app.useWebSocketAdapter(new SocketIoAdapter(app, config));

  const port = config.get<number>('PORT', 3002);
  await app.listen(port);

  console.log(`[order-service] Running on port ${port}`);
  console.log(`[order-service] WebSocket gateway active on /orders namespace`);
}

bootstrap();
