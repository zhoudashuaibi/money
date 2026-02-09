// 分析记录实体
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('analysis_records')
@Index(['userId', 'symbol'])
export class AnalysisRecord {
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

  @Column({ type: 'jsonb', nullable: true, name: 'agent_results' })
  agentResults: Record<string, any>;

  @Column({ length: 20, nullable: true })
  recommendation: string;

  @Column({ type: 'int', nullable: true, name: 'confidence_score' })
  confidenceScore: number;

  @Column({ type: 'int', default: 0, name: 'total_tokens' })
  totalTokens: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
