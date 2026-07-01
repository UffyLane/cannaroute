import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

/**
 * ComplianceRules — one row per state, drives the entire compliance engine.
 *
 * Adding a new state = INSERT one row. Zero code changes required.
 * Every compliance decision in the platform traces back to a field in this table.
 *
 * Current seed: Michigan (MI) — adult-use + medical market.
 */
@Entity('compliance_rules')
export class ComplianceRules {
  @PrimaryColumn({ length: 2 })
  state_code: string; // MI, CO, CA, etc.

  @Column()
  state_name: string;

  @Column({ default: true })
  is_active: boolean;

  // ─── Market type ──────────────────────────────────────────────────────────
  @Column({ default: false })
  adult_use_allowed: boolean;

  @Column({ default: false })
  medical_allowed: boolean;

  @Column({ default: false })
  delivery_allowed: boolean;

  // ─── Purchase limits (per transaction) ───────────────────────────────────
  // Michigan adult-use: 2.5oz (70.87g) per transaction
  @Column('decimal', { precision: 8, scale: 3, nullable: true })
  adult_use_flower_limit_grams: number | null;

  // Michigan medical: 2.5oz (70.87g) per transaction
  @Column('decimal', { precision: 8, scale: 3, nullable: true })
  medical_flower_limit_grams: number | null;

  // Concentrate/extract limits (MI adult-use: 15g per transaction)
  @Column('decimal', { precision: 8, scale: 3, nullable: true })
  adult_use_concentrate_limit_grams: number | null;

  @Column('decimal', { precision: 8, scale: 3, nullable: true })
  medical_concentrate_limit_grams: number | null;

  // Edible limits by THC mg (MI adult-use: 100mg THC max per transaction)
  @Column('int', { nullable: true })
  adult_use_edible_thc_limit_mg: number | null;

  @Column('int', { nullable: true })
  medical_edible_thc_limit_mg: number | null;

  // ─── Delivery rules ───────────────────────────────────────────────────────
  @Column({ type: 'varchar', nullable: true })
  delivery_hours_start: string | null; // "09:00" — 24h format

  @Column({ type: 'varchar', nullable: true })
  delivery_hours_end: string | null;   // "21:00"

  @Column({ default: false })
  delivery_requires_age_verification: boolean;

  @Column({ default: false })
  delivery_requires_signature: boolean;

  // ─── Tax rates ────────────────────────────────────────────────────────────
  // Michigan: 10% excise + 6% sales = 16% effective
  @Column('decimal', { precision: 5, scale: 4, default: 0 })
  excise_tax_rate: number; // 0.10 = 10%

  @Column('decimal', { precision: 5, scale: 4, default: 0 })
  sales_tax_rate: number;  // 0.06 = 6%

  // ─── Seed-to-sale system ─────────────────────────────────────────────────
  @Column({ type: 'varchar', nullable: true })
  seed_to_sale_system: string | null; // 'metrc' | 'biotrack' | 'leaf'

  @Column({ type: 'varchar', nullable: true })
  license_api_url: string | null; // State licensing authority API

  // ─── COA requirements ─────────────────────────────────────────────────────
  @Column({ default: 365 })
  coa_validity_days: number; // How long a COA is valid before requiring renewal

  @Column({ default: false })
  require_pesticide_testing: boolean;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
