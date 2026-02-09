import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCoreTables1700000000001 implements MigrationInterface {
  name = 'InitCoreTables1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 启用 uuid-ossp 扩展
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. 用户表
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar(100) NOT NULL,
        "nickname" varchar(50) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "role" varchar(20) NOT NULL DEFAULT 'user',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // 2. 自选股表
    await queryRunner.query(`
      CREATE TABLE "watchlist_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "symbol" varchar(20) NOT NULL,
        "name" varchar(100) NOT NULL,
        "market" varchar(10) NOT NULL,
        "sort_order" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_watchlist_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_watchlist_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_watchlist_user_symbol" UNIQUE ("user_id", "symbol")
      )
    `);

    // 3. 行情快照表
    await queryRunner.query(`
      CREATE TABLE "quote_snapshots" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "symbol" varchar(20) NOT NULL,
        "name" varchar(100) NOT NULL,
        "market" varchar(10) NOT NULL,
        "price" decimal(12,4) NOT NULL,
        "change_pct" decimal(8,4) NOT NULL,
        "volume" bigint NOT NULL DEFAULT 0,
        "amount" decimal(16,2) NOT NULL DEFAULT 0,
        "high_price" decimal(12,4),
        "low_price" decimal(12,4),
        "open_price" decimal(12,4),
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quote_snapshots" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_quote_symbol_market"
        ON "quote_snapshots" ("symbol", "market")
    `);

    // 4. 新闻文章表
    await queryRunner.query(`
      CREATE TABLE "news_articles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" varchar(500) NOT NULL,
        "summary" text,
        "url" varchar(1000),
        "source" varchar(100),
        "symbol" varchar(20),
        "sentiment_score" decimal(4,2),
        "published_at" TIMESTAMP,
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_news_articles" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_news_symbol"
        ON "news_articles" ("symbol")
    `);

    // 5. 分析记录表
    await queryRunner.query(`
      CREATE TABLE "analysis_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "symbol" varchar(20) NOT NULL,
        "name" varchar(100) NOT NULL,
        "agent_results" jsonb,
        "recommendation" varchar(20),
        "confidence_score" int,
        "total_tokens" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_analysis_records" PRIMARY KEY ("id"),
        CONSTRAINT "FK_analysis_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_analysis_user_symbol"
        ON "analysis_records" ("user_id", "symbol")
    `);

    // 6. 预警规则表
    await queryRunner.query(`
      CREATE TABLE "alert_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "symbol" varchar(20) NOT NULL,
        "name" varchar(100) NOT NULL,
        "condition_type" varchar(30) NOT NULL,
        "threshold_value" decimal(12,4) NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "last_triggered_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_alert_rules" PRIMARY KEY ("id"),
        CONSTRAINT "FK_alert_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "alert_rules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "analysis_records"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "news_articles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quote_snapshots"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "watchlist_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
