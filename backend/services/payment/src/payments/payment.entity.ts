import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type PaymentProcessor = 'canpay' | 'aeropay' | 'cash' | 'point_of_banking';

@Entity('payments')
@Index(['order_id'], { unique: true })
@Index(['customer_id'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column('uuid')
  customer_id: string;

  @Column('uuid')
  dispensary_id: string;

  /** Total amount in cents */
  @Column('int')
  amount_cents: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: ['canpay', 'aeropay', 'cash', 'point_of_banking'],
  })
  processor: PaymentProcessor;

  /**
   * External reference ID from the payment processor.
   * For CanPay: transaction_id
   * For AeroPay: payment_uuid
   * For cash/POB: null (no external reference)
   */
  @Column({ type: 'varchar', nullable: true })
  processor_transaction_id: string | null;

  /**
   * Deep-link URL for CanPay / AeroPay — sent to customer app to open the
   * payment processor's native app and authorize the payment.
   */
  @Column({ type: 'varchar', nullable: true })
  processor_redirect_url: string | null;

  /** Raw webhook payload from processor — stored for reconciliation */
  @Column({ type: 'jsonb', nullable: true })
  processor_response: Record<string, unknown> | null;

  /** Refund amount in cents (if partially refunded) */
  @Column('int', { default: 0 })
  refunded_cents: number;

  /** Human-readable failure reason */
  @Column({ type: 'varchar', nullable: true })
  failure_reason: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
