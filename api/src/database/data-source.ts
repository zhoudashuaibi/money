// TypeORM CLI 数据源配置（用于迁移命令）
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME || 'invest_mvp',
  username: process.env.DB_USER || 'invest_user',
  password: process.env.DB_PASSWORD || 'changeme',
  entities: ['src/modules/**/entities/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
