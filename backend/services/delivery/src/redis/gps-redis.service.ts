import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: string;
  accuracy_meters?: number;
}

/**
 * GpsRedisService owns all Redis interactions for live GPS tracking.
 *
 * Key design decisions:
 *
 * SET gps:{order_id}               → latest position (TTL 5 min)
 *   Used by customer app to show current driver location on map load.
 *
 * LPUSH gps_route:{order_id}       → full route log (no TTL during delivery)
 *   Stored as JSON strings. Harvested when delivery completes, written to
 *   deliveries.gps_route in Postgres, then DEL'd from Redis.
 *
 * PUBLISH gps_updates {payload}    → pub/sub for real-time relay
 *   The order service subscribes to this channel via a separate Redis
 *   subscriber connection and emits driver:position events to customers
 *   via the Socket.IO gateway. This keeps the delivery service decoupled
 *   from the WebSocket layer.
 */
@Injectable()
export class GpsRedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GpsRedisService.name);
  private publisher: Redis;    // Used for commands (SET, LPUSH, PUBLISH)
  private readonly GPS_TTL_SECONDS = 300; // 5 minutes

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.publisher = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get<string>('REDIS_PASSWORD'),
      lazyConnect: true,
    });

    this.publisher.on('error', (err) => {
      this.logger.error('Redis publisher error', err);
    });

    this.logger.log('GpsRedisService initialized');
  }

  onModuleDestroy() {
    this.publisher?.disconnect();
  }

  // ─── Write latest position ────────────────────────────────────────────────

  async setPosition(orderId: string, point: GpsPoint): Promise<void> {
    await this.publisher.set(
      `gps:${orderId}`,
      JSON.stringify(point),
      'EX',
      this.GPS_TTL_SECONDS,
    );
  }

  // ─── Get latest position (for customer polling fallback) ──────────────────

  async getPosition(orderId: string): Promise<GpsPoint | null> {
    const raw = await this.publisher.get(`gps:${orderId}`);
    return raw ? (JSON.parse(raw) as GpsPoint) : null;
  }

  // ─── Route log ────────────────────────────────────────────────────────────

  async appendRoutePoint(orderId: string, point: GpsPoint): Promise<void> {
    // LPUSH prepends — we reverse on read so the final array is chronological
    await this.publisher.lpush(`gps_route:${orderId}`, JSON.stringify(point));
  }

  async getRoute(orderId: string): Promise<GpsPoint[]> {
    const raw = await this.publisher.lrange(`gps_route:${orderId}`, 0, -1);
    // Reverse because LPUSH prepends — index 0 is the most recent point
    return raw.reverse().map((r) => JSON.parse(r) as GpsPoint);
  }

  async clearRoute(orderId: string): Promise<void> {
    await this.publisher.del(`gps_route:${orderId}`, `gps:${orderId}`);
  }

  // ─── Pub/sub publish ──────────────────────────────────────────────────────

  /**
   * Publishes to 'gps_updates' channel.
   * The order service runs a subscriber that calls ordersGateway.emitDriverPosition()
   * when it receives a message on this channel.
   */
  async publishPosition(
    orderId: string,
    point: GpsPoint,
  ): Promise<void> {
    await this.publisher.publish(
      'gps_updates',
      JSON.stringify({ order_id: orderId, ...point }),
    );
  }
}
