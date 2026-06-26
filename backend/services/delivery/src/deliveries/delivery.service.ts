import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js';
import { Delivery } from './delivery.entity';
import { UpdateGpsDto } from './dto/update-gps.dto';
import { IdVerifyDto } from './dto/id-verify.dto';
import { CaptureSignatureDto } from './dto/capture-signature.dto';
import { GpsRedisService } from '../redis/gps-redis.service';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);
  private readonly s3: S3Client;
  private readonly maps: GoogleMapsClient;
  private readonly s3Bucket: string;

  constructor(
    @InjectRepository(Delivery)
    private readonly deliveriesRepo: Repository<Delivery>,

    private readonly config: ConfigService,
    private readonly gpsRedis: GpsRedisService,
  ) {
    this.s3 = new S3Client({
      region: config.get<string>('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });

    this.maps = new GoogleMapsClient();
    this.s3Bucket = config.get<string>('S3_BUCKET', 'cannaroute-deliveries');
  }

  // ─── Create delivery record (called by order service after confirm) ────────

  async create(orderId: string, driverId: string): Promise<Delivery> {
    const existing = await this.deliveriesRepo.findOne({ where: { order_id: orderId } });
    if (existing) throw new BadRequestException(`Delivery for order ${orderId} already exists`);

    const delivery = this.deliveriesRepo.create({
      order_id: orderId,
      driver_id: driverId,
      status: 'assigned',
    });

    return this.deliveriesRepo.save(delivery);
  }

  // ─── Active delivery for driver ───────────────────────────────────────────

  async getActiveForDriver(driverId: string): Promise<Delivery | null> {
    return this.deliveriesRepo.findOne({
      where: {
        driver_id: driverId,
        status: 'en_route_delivery', // most relevant active status
      },
    }) ?? this.deliveriesRepo.findOne({
      where: [
        { driver_id: driverId, status: 'assigned' },
        { driver_id: driverId, status: 'en_route_pickup' },
        { driver_id: driverId, status: 'at_dispensary' },
        { driver_id: driverId, status: 'at_door' },
      ],
    });
  }

  // ─── GPS update ───────────────────────────────────────────────────────────

  /**
   * Called by the driver app every ~5 seconds while on a delivery.
   *
   * Flow:
   *   1. Write to Redis: SET gps:{order_id} {lat,lng,ts} EX 300
   *      (5-min TTL — if driver goes offline, position expires cleanly)
   *   2. Append to Redis list: LPUSH gps_route:{order_id} {lat,lng,ts}
   *      (full route log, harvested when delivery completes)
   *   3. Publish to Redis channel: PUBLISH gps_updates {order_id, lat, lng}
   *      (order service WebSocket subscriber picks this up and emits to customer)
   *
   * We do NOT write to PostgreSQL on every GPS ping — that's 1 write/5s per
   * active driver hitting the DB. Redis handles the volume; Postgres gets the
   * summarized route only at delivery completion.
   */
  async updateGps(deliveryId: string, dto: UpdateGpsDto): Promise<{ ok: boolean }> {
    const delivery = await this.findById(deliveryId);

    const position = {
      lat: dto.lat,
      lng: dto.lng,
      timestamp: new Date().toISOString(),
      accuracy_meters: dto.accuracy_meters,
    };

    await this.gpsRedis.setPosition(delivery.order_id, position);
    await this.gpsRedis.appendRoutePoint(delivery.order_id, position);
    await this.gpsRedis.publishPosition(delivery.order_id, position);

    return { ok: true };
  }

  // ─── ID verification at door ──────────────────────────────────────────────

  async verifyId(deliveryId: string, dto: IdVerifyDto): Promise<Delivery> {
    const delivery = await this.findById(deliveryId);

    const currentYear = new Date().getFullYear();
    const age = currentYear - dto.customer_dob_year;

    if (age < 21) {
      throw new UnprocessableEntityException({
        error: 'age_verification_failed',
        message: `Customer must be 21+. Birth year ${dto.customer_dob_year} indicates age ${age}.`,
      });
    }

    delivery.age_verified_at_door = new Date();
    delivery.customer_dob_year = dto.customer_dob_year;
    delivery.status = 'at_door';

    return this.deliveriesRepo.save(delivery);
  }

  // ─── Capture signature ────────────────────────────────────────────────────

  async captureSignature(deliveryId: string, dto: CaptureSignatureDto): Promise<Delivery> {
    const delivery = await this.findById(deliveryId);

    if (!delivery.age_verified_at_door) {
      throw new BadRequestException('Age must be verified before capturing signature');
    }

    // Strip the data URI prefix and decode base64
    const base64Data = dto.signature_data.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const s3Key = `deliveries/${delivery.order_id}/signature.png`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: 'image/png',
        // No public access — we generate presigned URLs on demand
        ServerSideEncryption: 'AES256',
        Metadata: {
          order_id: delivery.order_id,
          driver_id: delivery.driver_id,
          captured_at: new Date().toISOString(),
        },
      }),
    );

    delivery.signature_s3_key = s3Key;
    return this.deliveriesRepo.save(delivery);
  }

  // ─── Capture proof photo (multipart upload) ───────────────────────────────

  /**
   * Photo arrives as a multipart file (handled by Multer in the controller).
   * This method receives the file buffer directly.
   */
  async capturePhoto(
    deliveryId: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<Delivery> {
    const delivery = await this.findById(deliveryId);

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
      throw new BadRequestException('Photo must be JPEG or PNG');
    }

    const ext = file.mimetype === 'image/png' ? 'png' : 'jpg';
    const s3Key = `deliveries/${delivery.order_id}/proof.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: 'AES256',
        Metadata: {
          order_id: delivery.order_id,
          driver_id: delivery.driver_id,
          captured_at: new Date().toISOString(),
        },
      }),
    );

    delivery.proof_photo_s3_key = s3Key;

    return this.deliveriesRepo.save(delivery);
  }

  // ─── Complete delivery ────────────────────────────────────────────────────

  async complete(deliveryId: string): Promise<Delivery> {
    const delivery = await this.findById(deliveryId);

    if (!delivery.age_verified_at_door) {
      throw new BadRequestException('Cannot complete delivery — age verification not recorded');
    }
    if (!delivery.signature_s3_key && !delivery.proof_photo_s3_key) {
      throw new BadRequestException('Cannot complete delivery — no proof of delivery captured');
    }

    // Harvest the GPS route from Redis and persist it
    const routePoints = await this.gpsRedis.getRoute(delivery.order_id);
    if (routePoints.length > 0) {
      delivery.gps_route = routePoints;
    }

    // Compute distance + duration from route if we have enough points
    if (routePoints.length >= 2) {
      delivery.distance_km = this.estimateDistanceKm(routePoints);
    }

    delivery.status = 'completed';
    delivery.delivered_at = new Date();

    const saved = await this.deliveriesRepo.save(delivery);

    // Clean up Redis route log — no longer needed
    await this.gpsRedis.clearRoute(delivery.order_id);

    return saved;
  }

  // ─── Get delivery detail ──────────────────────────────────────────────────

  async findById(deliveryId: string): Promise<Delivery> {
    const delivery = await this.deliveriesRepo.findOne({ where: { id: deliveryId } });
    if (!delivery) throw new NotFoundException(`Delivery ${deliveryId} not found`);
    return delivery;
  }

  async findByOrderId(orderId: string): Promise<Delivery> {
    const delivery = await this.deliveriesRepo.findOne({ where: { order_id: orderId } });
    if (!delivery) throw new NotFoundException(`No delivery found for order ${orderId}`);
    return delivery;
  }

  // ─── Driver history ───────────────────────────────────────────────────────

  async getDriverHistory(driverId: string, limit = 20): Promise<Delivery[]> {
    return this.deliveriesRepo.find({
      where: { driver_id: driverId, status: 'completed' },
      order: { delivered_at: 'DESC' },
      take: limit,
    });
  }

  // ─── Available drivers (internal — called by order service) ───────────────

  async getAvailableDrivers(dispensaryId: string): Promise<string[]> {
    // TODO: Query drivers table for drivers with status='active' and no in-progress delivery
    // For now: stub returning empty array
    // Real implementation: JOIN drivers WHERE employment_dispensary_id = dispensaryId
    //   AND id NOT IN (SELECT driver_id FROM deliveries WHERE status NOT IN ('completed','failed'))
    this.logger.warn(`getAvailableDrivers stub called for dispensary ${dispensaryId}`);
    return [];
  }

  // ─── Presigned URL helper ─────────────────────────────────────────────────

  async getPresignedUrl(s3Key: string, expiresInSeconds = 300): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.s3Bucket,
      Key: s3Key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  // ─── Google Maps route ────────────────────────────────────────────────────

  async computeRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ) {
    const apiKey = this.config.get<string>('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      this.logger.warn('GOOGLE_MAPS_API_KEY not set — skipping route computation');
      return null;
    }

    try {
      const response = await this.maps.directions({
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          key: apiKey,
        },
      });

      const route = response.data.routes[0];
      if (!route) return null;

      return {
        distance_km: route.legs[0].distance.value / 1000,
        duration_minutes: Math.ceil(route.legs[0].duration.value / 60),
        polyline: route.overview_polyline.points,
      };
    } catch (err) {
      this.logger.error('Google Maps directions API error', err);
      return null;
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Haversine formula — rough distance estimate from GPS route array.
   * Used as a fallback when Google Maps isn't available.
   */
  private estimateDistanceKm(
    points: Array<{ lat: number; lng: number }>,
  ): number {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += this.haversine(points[i - 1], points[i]);
    }
    return Math.round(total * 100) / 100;
  }

  private haversine(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
  ): number {
    const R = 6371; // Earth radius km
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
}
