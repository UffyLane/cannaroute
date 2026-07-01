import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { UserRole } from '@cannaroute/shared';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  // Nullable — set null for SSO-only accounts
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password_hash: string | null;

  @Column({ type: 'varchar', length: 32 })
  role: UserRole;

  @Column({ length: 128 })
  first_name: string;

  @Column({ length: 128 })
  last_name: string;

  // ─── Age / ID verification ────────────────────────────────────────────────

  @Column({ default: false })
  age_verified: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  age_verified_at: Date | null;

  @Column({ type: 'date', nullable: true })
  dob: Date | null;

  // ─── Medical patient ──────────────────────────────────────────────────────

  @Column({ default: false })
  is_medical: boolean;

  @Column({ type: 'varchar', length: 128, nullable: true })
  medical_card_number: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  medical_card_state: string | null;

  @Column({ type: 'date', nullable: true })
  medical_card_expiry: Date | null;

  @Column({ default: false })
  medical_verified: boolean;

  // ─── Jurisdiction ─────────────────────────────────────────────────────────

  @Index()
  @Column({ type: 'varchar', length: 2, nullable: true })
  state_code: string | null;

  // ─── Auth ─────────────────────────────────────────────────────────────────

  @Column({ default: false })
  mfa_enabled: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password_reset_token: string | null;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  password_reset_expires: Date | null;

  // ─── Timestamps ───────────────────────────────────────────────────────────

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;
}
