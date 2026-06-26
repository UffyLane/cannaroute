import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * PesticideLog — grower-submitted record of pesticide applications.
 *
 * Two paths:
 *  1. no_pesticides_used = true → grower self-certifies clean grow, no EPA lookup needed
 *  2. epa_reg_number provided → we cross-check against EPA pesticide registration API
 *     to confirm the product is registered and label allows cannabis application
 *
 * All logs are visible to customers on the product detail screen — this is the
 * grower transparency feature. Customers can see exactly what was applied to their
 * product before it was harvested.
 *
 * Dispensary compliance teams can audit these logs before activating products.
 */
@Entity('pesticide_logs')
@Index(['grower_id', 'applied_date'])
export class PesticideLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  grower_id: string;

  @Column('uuid', { nullable: true })
  product_id: string | null; // Null = applies to whole farm/batch

  // ─── No pesticides path ───────────────────────────────────────────────────
  @Column({ default: false })
  no_pesticides_used: boolean;

  // ─── Pesticide application path ───────────────────────────────────────────
  @Column({ nullable: true })
  pesticide_name: string | null;

  @Column({ nullable: true })
  active_ingredient: string | null;

  // EPA registration number — format: XXXXX-XXXXX
  @Column({ nullable: true })
  epa_reg_number: string | null;

  // EPA verification result
  @Column({ default: false })
  epa_verified: boolean;

  @Column({ nullable: true })
  epa_verified_name: string | null; // Product name from EPA database

  @Column({ nullable: true, type: 'timestamptz' })
  epa_verified_at: Date | null;

  @Column({ nullable: true })
  application_method: string | null; // spray, drench, foliar, etc.

  @Column({ nullable: true })
  application_rate: string | null; // "2 oz per gallon"

  @Column({ type: 'date', nullable: true })
  applied_date: string | null;

  @Column({ type: 'date', nullable: true })
  pre_harvest_interval_days: string | null; // PHI from label

  @Column({ nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
