import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
@Index(['order_id'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column('uuid')
  product_id: string;

  @Column({ type: 'varchar', nullable: true })
  batch_id: string | null;

  @Column()
  product_name: string;

  @Column()
  product_category: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  thc_percentage: number | null;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  cbd_percentage: number | null;

  @Column('decimal', { precision: 8, scale: 3 })
  weight_grams: number;

  @Column('int')
  quantity: number;

  @Column('int')
  unit_price_cents: number;

  @Column('int')
  subtotal_cents: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
