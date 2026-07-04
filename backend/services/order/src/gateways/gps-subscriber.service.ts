import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { OrdersGateway } from './orders.gateway';

interface GpsPayload {
  order_id: string;
  lat: number;
  lng: number;
  timestamp: string;
  accuracy_meters?: number;
}

/**
 * GpsSubscriberService
 *
 * Listens on the Redis 'gps_updates' pub/sub channel.
 * The delivery service publishes a message here every time the driver app
 * sends a GPS ping. This service receives those messages and forwards them
 * to connected WebSocket clients via the OrdersGateway.
 *
 * Why pub/sub instead of direct call?
 *   The delivery service doesn't know about the WebSocket layer — that's
 *   the order service's job. Pub/sub keeps the services decoupled: delivery
 *   publishes "GPS changed", and any subscriber (order service, future analytics
 *   service, admin dashboard) can react independently.
 *
 * Redis connection note:
 *   ioredis requires a dedicated connection for SUBSCRIBE — a subscribed
 *   connection can only send subscribe/unsubscribe/psubscribe commands.
 *   We use a separate Redis client here (subscriber) from the one used
 *   for regular commands in gps-redis.service.ts (publisher).
 */
@Injectable()
export class GpsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GpsSubscriberService.name);
  private subscriber: Redis;

  constructor(
    private readonly config: ConfigService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  onModuleInit() {
    this.subscriber = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      lazyConnect: true,
    });

    this.subscriber.on('error', (err: Error) => {
      this.logger.error('GPS subscriber Redis error', err);
    });

    this.subscriber
      .subscribe('gps_updates')
      .then((count) => {
        this.logger.log(`Subscribed to ${count} Redis channel(s) — listening for GPS updates`);
      })
      .catch((err: Error) => {
        this.logger.error('Failed to subscribe to gps_updates channel', err);
      });

    this.subscriber.on('message', (channel: string, message: string) => {
      if (channel !== 'gps_updates') return;

      try {
        const payload: GpsPayload = JSON.parse(message);

        this.ordersGateway.emitDriverPosition({
          order_id: payload.order_id,
          lat: payload.lat,
          lng: payload.lng,
          timestamp: payload.timestamp,
          accuracy_meters: payload.accuracy_meters,
        });
      } catch (err) {
        this.logger.error('Failed to parse GPS update message', err);
      }
    });
  }

  onModuleDestroy() {
    this.subscriber?.unsubscribe();
    this.subscriber?.disconnect();
  }
}
