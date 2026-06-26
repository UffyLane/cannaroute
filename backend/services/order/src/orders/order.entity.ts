import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { OrderStatus, PaymentMethod } from '@cannaroute/shared';
import { OrderItem } from './order-item.entity';

@Entity('orders')
@Index(['customer_id', 'status'])
@Index(['dispensary_id', 'status'])
@Index(['driver_id', 'status'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  customer_id: string;

  @Column('uuid')
  dispensary_id: string;

  @Column('uuid', { nullable: true })
  driver_id: string | null;

  @Column({
    type: 'enum',
    enum: ['placed', 'confirmed', 'preparing', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
    default: 'placed',
  })
  status: OrderStatus;

  @Column('int')
  subtotal_cents: number;

  @Column('int', { default: 0 })
  tax_cents: number;

  @Column('int', { default: 0 })
  delivery_fee_cents: number;

  @Column('int', { default: 0 })
  platform_fee_cents: number;

  @Column('int')
  total_cents: number;

  @Column({ type: 'enum', enum: ['point_of_banking', 'ach', 'cash'] })
  payment_method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'pending',
  })
  payment_status: string;

  @Column()
  delivery_address_line1: string;

  @Column({ nullable: true })
  delivery_address_line2: string | null;

  @Column()
  delivery_address_city: string;

  @Column({ length: 2 })
  delivery_address_state: string;

  @Column({ length: 10 })
  delivery_address_zip: string;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  delivery_lat: number | null;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  delivery_lng: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  scheduled_delivery_at: Date | null;

  @Column({ default: false })
  compliance_check_passed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  compliance_check_notes: Record<string, unknown> | null;

  @Column({ nullable: true })
  metrc_transfer_id: string | null;

  @Column({ nullable: true })
  cancelled_reason: string | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: false })
  items: OrderItem[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;
}
