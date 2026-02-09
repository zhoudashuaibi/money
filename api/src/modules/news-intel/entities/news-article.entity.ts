// 新闻文章实体
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('news_articles')
@Index(['symbol'])
export class NewsArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ length: 1000, nullable: true })
  url: string;

  @Column({ length: 100, nullable: true })
  source: string;

  @Column({ length: 20, nullable: true })
  symbol: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true, name: 'sentiment_score' })
  sentimentScore: number;

  @Column({ type: 'timestamp', nullable: true, name: 'published_at' })
  publishedAt: Date;

  @CreateDateColumn({ name: 'fetched_at' })
  fetchedAt: Date;
}
