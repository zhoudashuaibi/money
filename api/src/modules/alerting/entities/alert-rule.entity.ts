// 预警规则实体
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('alert_rules')
export class AlertRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 20 })
  symbol: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 30, name: 'condition_type' })
  conditionType: string; // price_above | price_below | change_pct_above | change_pct_below

  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'threshold_value' })
  thresholdValue: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'last_triggered_at' })
  lastTriggeredAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
