import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Grower — farm profile with multi-step verification pipeline.
 *
 * Verification stages (verification_status field):
 *   pending → license_verified → coa_submitted → fully_verified
 *
 * Auto-verified signals (no manual review needed):
 *   - license_verified: CRA Accela API returns active license
 *   - clean_green_certified: scraped from cleangreen.org public directory
 *   - sun_earth_certified: scraped from sunandearthcertified.org
 *
 * Manual review only needed if auto-verification fails.
 * Goal: grower can go from signup → product on menu in < 24 hours.
 */
@Entity('growers')
export class Grower {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column()
  farm_name: string;

  @Column({ type: 'varchar', nullable: true })
  farm_description: string | null;

  @Column()
  license_number: string;

  @Column({ length: 2 })
  state_code: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'license_verified', 'coa_submitted', 'fully_verified', 'rejected'],
    default: 'pending',
  })
  verification_status: string;

  // ─── Location ─────────────────────────────────────────────────────────────
  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  county: string | null;

  // ─── Certifications (auto-verified from public directories) ───────────────
  @Column({ default: false })
  clean_green_certified: boolean;

  @Column({ type: 'varchar', nullable: true })
  clean_green_cert_number: string | null;

  @Column({ default: false })
  sun_earth_certified: boolean;

  @Column({ type: 'varchar', nullable: true })
  sun_earth_cert_number: string | null;

  @Column({ default: false })
  usda_organic: boolean;

  // ─── Growing practices (shown to customers on product detail) ─────────────
  @Column({ default: false })
  no_pesticides_used: boolean;

  @Column({ default: false })
  outdoor_grown: boolean;

  @Column({ default: false })
  indoor_grown: boolean;

  @Column({ default: false })
  greenhouse_grown: boolean;

  // ─── Media ────────────────────────────────────────────────────────────────
  @Column({ type: 'varchar', nullable: true })
  farm_photo_s3_key: string | null;

  @Column({ type: 'varchar', nullable: true })
  logo_s3_key: string | null;

  // ─── License verification ─────────────────────────────────────────────────
  @Column({ nullable: true, type: 'timestamptz' })
  license_verified_at: Date | null;

  @Column({ nullable: true, type: 'date' })
  license_expiry_date: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
