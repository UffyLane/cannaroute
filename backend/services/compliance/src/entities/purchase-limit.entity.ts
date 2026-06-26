import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * PurchaseLimit tracks cumulative cannabis purchases per customer per day per state.
 *
 * Michigan rules require tracking within a rolling purchase window.
 * We record every completed order here so the compliance check can sum
 * today's purchases and compare against state limits before allowing a new order.
 *
 * Index on (customer_id, state_code, purchase_date) for fast lookups at order time.
 */
@Entity('purchase_limits')
@Index(['customer_id', 'state_code', 'purchase_date'])
export class PurchaseLimit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  customer_id: string;

  @Column('uuid')
  order_id: string;

  @Column({ length: 2 })
  state_code: string;

  // Date only (no time) — rolling daily window
  @Column({ type: 'date' })
  purchase_date: string; // 'YYYY-MM-DD'

  // What was purchased — drives limit calculation
  @Column('decimal', { precision: 8, scale: 3, default: 0 })
  flower_grams: number;

  @Column('decimal', { precision: 8, scale: 3, default: 0 })
  concentrate_grams: number;

  @Column('int', { default: 0 })
  edible_thc_mg: number;

  @Column({ default: false })
  is_medical: boolean; // determines which limit tier applies

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
