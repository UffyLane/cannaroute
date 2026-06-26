import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Delivery tracks the physical movement of an order from dispensary to customer door.
 * One delivery per order (1:1 relationship via order_id).
 *
 * GPS privacy rules:
 *   - gps_route stores the driver's path AFTER delivery is complete (audit trail)
 *   - Live GPS is stored in Redis only (TTL 5 min) — not persisted to this table
 *   - age_verified_at_door + customer_dob_year = compliance proof, never raw ID scan
 */
@Entity('deliveries')
@Index(['order_id'], { unique: true })
@Index(['driver_id', 'status'])
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  order_id: string;

  @Column('uuid')
  driver_id: string;

  @Column({
    type: 'enum',
    enum: ['assigned', 'en_route_pickup', 'at_dispensary', 'en_route_delivery', 'at_door', 'completed', 'failed'],
    default: 'assigned',
  })
  status: string;

  // ─── Route ────────────────────────────────────────────────────────────────
  // JSONB array: [{ lat, lng, timestamp, accuracy_meters }]
  // Appended at completion from Redis route log — not written on every GPS ping
  @Column({ type: 'jsonb', nullable: true })
  gps_route: Array<{ lat: number; lng: number; timestamp: string; accuracy_meters?: number }> | null;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  distance_km: number | null;

  @Column('int', { nullable: true })
  duration_minutes: number | null;

  // ─── Age verification at door ─────────────────────────────────────────────
  // We confirm the customer is 21+ by checking their ID at the door.
  // We store ONLY the birth year (for audit) — never name, ID number, or full DOB.
  // This is sufficient for compliance and eliminates PII exposure.
  @Column({ type: 'timestamptz', nullable: true })
  age_verified_at_door: Date | null;

  @Column('int', { nullable: true })
  customer_dob_year: number | null; // e.g. 1990 — proves 21+ without storing DOB

  // ─── Proof of delivery ────────────────────────────────────────────────────
  // S3 keys — never store the signed URL here (those are generated on-demand)
  @Column({ nullable: true })
  signature_s3_key: string | null; // s3://cannaroute-deliveries/{order_id}/signature.png

  @Column({ nullable: true })
  proof_photo_s3_key: string | null; // s3://cannaroute-deliveries/{order_id}/proof.jpg

  @Column({ nullable: true })
  notes: string | null;

  // ─── Google Maps route data ────────────────────────────────────────────────
  @Column({ nullable: true })
  maps_route_id: string | null; // Google Maps route token for navigation

  @Column({ nullable: true })
  maps_polyline: string | null; // encoded polyline for customer map display

  // ─── Timestamps ───────────────────────────────────────────────────────────
  @Column({ type: 'timestamptz', nullable: true })
  picked_up_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  delivered_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
