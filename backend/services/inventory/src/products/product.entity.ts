import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

/**
 * Product represents a SKU in a dispensary's menu.
 *
 * Key rules:
 *  - price_cents: always integers, never floats (no floating-point money)
 *  - weight_grams: drives cannabis purchase limit calculations per state
 *  - status 'coa_expired': set automatically when lab_tests.expiry_date passes
 *    Customers never see products in this state — filtered at the menu query level
 *  - COA is stored in lab_tests table (separate entity), linked by product_id
 */
@Entity('products')
@Index(['dispensary_id', 'status'])
@Index(['dispensary_id', 'category'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  dispensary_id: string;

  @Column('uuid', { nullable: true })
  grower_id: string | null;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column()
  category: string; // flower | concentrate | edible | tincture | topical | preroll

  @Column()
  strain: string;

  @Column({
    type: 'enum',
    enum: ['indica', 'sativa', 'hybrid', 'cbd', 'na'],
    default: 'hybrid',
  })
  strain_type: string;

  // Price in cents — $45.00 = 4500
  @Column('int')
  price_cents: number;

  // Weight drives compliance purchase limit calculations
  @Column('decimal', { precision: 8, scale: 3 })
  weight_grams: number;

  // THC/CBD from the most recent passing COA
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  thc_percentage: number | null;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  cbd_percentage: number | null;

  @Column('int', { default: 0 })
  stock_quantity: number;

  // Metrc package/batch tag — required for seed-to-sale tracking
  @Column({ type: 'varchar', nullable: true })
  metrc_package_tag: string | null;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'coa_expired', 'out_of_stock'],
    default: 'inactive',
  })
  status: string;

  // Product image stored in S3
  @Column({ type: 'varchar', nullable: true })
  image_s3_key: string | null;

  @Column({ type: 'jsonb', nullable: true })
  terpenes: Array<{ name: string; percentage: number }> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;
}
