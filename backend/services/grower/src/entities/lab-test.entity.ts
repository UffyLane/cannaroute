import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * LabTest stores parsed COA (Certificate of Analysis) data.
 *
 * COA flow:
 *  1. Grower uploads PDF → S3
 *  2. Tesseract.js OCR extracts text from PDF
 *  3. Parser pulls key fields: THC%, CBD%, pesticide panel, heavy metals, etc.
 *  4. parse_confidence (0-1) indicates OCR quality — low confidence = flag for manual review
 *  5. Grower reviews parsed data and confirms → status = 'confirmed'
 *  6. Product is activated on the menu
 *
 * expiry_date drives the COA expiry enforcement in the inventory service.
 * Michigan COAs are valid for 1 year from test date (compliance_rules.coa_validity_days).
 */
@Entity('lab_tests')
@Index(['product_id', 'tested_at'])
@Index(['grower_id'])
export class LabTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  product_id: string;

  @Column('uuid')
  grower_id: string;

  @Column()
  lab_name: string;

  @Column({ nullable: true })
  lab_license_number: string | null;

  // S3 key for the original PDF
  @Column()
  coa_s3_key: string;

  // ─── Parsed cannabinoid results ───────────────────────────────────────────
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  thc_percentage: number | null;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  thca_percentage: number | null;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  cbd_percentage: number | null;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  cbda_percentage: number | null;

  // ─── Safety panels ────────────────────────────────────────────────────────
  @Column({ nullable: true })
  pesticide_panel: string | null; // 'pass' | 'fail' | 'not_tested'

  @Column({ nullable: true })
  heavy_metals_panel: string | null;

  @Column({ nullable: true })
  microbials_panel: string | null;

  @Column({ nullable: true })
  mycotoxins_panel: string | null;

  @Column({ nullable: true })
  residual_solvents_panel: string | null;

  @Column({ default: false })
  overall_pass: boolean;

  // ─── OCR metadata ─────────────────────────────────────────────────────────
  // 0.0 to 1.0 — below 0.7 flagged for manual review
  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  parse_confidence: number;

  @Column({ type: 'jsonb', nullable: true })
  raw_parsed_data: Record<string, unknown> | null;

  // ─── Status ───────────────────────────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: ['pending_parse', 'parsed', 'confirmed', 'rejected'],
    default: 'pending_parse',
  })
  status: string;

  // ─── Dates ────────────────────────────────────────────────────────────────
  @Column({ type: 'date' })
  tested_at: string; // Date of testing from COA

  @Column({ type: 'date', nullable: true })
  expiry_date: string | null; // tested_at + coa_validity_days

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
