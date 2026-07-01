import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('notifications')
@Index(['user_id', 'created_at'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column()
  type: string; // order_confirmed, driver_assigned, delivery_complete, etc.

  @Column({ default: 'push' })
  channel: string; // push | sms | email

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, string> | null; // Deep link data for push notifications

  @Column({ default: 'pending' })
  status: string; // pending | sent | failed

  @Column({ type: 'varchar', nullable: true })
  error_message: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  sent_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
