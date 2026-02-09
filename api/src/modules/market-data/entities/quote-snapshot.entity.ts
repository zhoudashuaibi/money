// 行情快照实体
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('quote_snapshots')
@Index(['symbol', 'market'])
export class QuoteSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  symbol: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 10 })
  market: string;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  price: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, name: 'change_pct' })
  changePct: number;

  @Column({ type: 'bigint', default: 0 })
  volume: number;

  @Column({ type: 'decimal', precision: 16, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'high_price', nullable: true })
  highPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'low_price', nullable: true })
  lowPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, name: 'open_price', nullable: true })
  openPrice: number;

  @CreateDateColumn({ name: 'fetched_at' })
  fetchedAt: Date;
}
