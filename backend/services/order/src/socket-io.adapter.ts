import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

/**
 * SocketIoAdapter — wires Socket.IO CORS through ConfigService instead of
 * reading process.env directly in the @WebSocketGateway decorator.
 *
 * Usage in main.ts:
 *   const config = app.get(ConfigService);
 *   app.useWebSocketAdapter(new SocketIoAdapter(app, config));
 */
export class SocketIoAdapter extends IoAdapter {
  private readonly allowedOrigins: string[];

  constructor(app: INestApplication, config: ConfigService) {
    super(app);
    const raw = config.get<string>(
      'CORS_ORIGINS',
      'http://localhost:3000,http://localhost:19006',
    );
    this.allowedOrigins = raw.split(',').map((o) => o.trim());
  }

  createIOServer(port: number, options?: ServerOptions) {
    return super.createIOServer(port, {
      ...options,
      cors: {
        origin: this.allowedOrigins,
        credentials: true,
      },
    });
  }
}
