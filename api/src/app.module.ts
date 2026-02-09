// 根模块 - 整合所有业务模块
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';

// 业务模块
import { AuthModule } from './modules/auth/auth.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { MarketDataModule } from './modules/market-data/market-data.module';
import { NewsIntelModule } from './modules/news-intel/news-intel.module';
import { AiGatewayModule } from './modules/ai-gateway/ai-gateway.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AlertingModule } from './modules/alerting/alerting.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // 全局配置
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // 数据库连接
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        database: config.get<string>('database.name'),
        username: config.get<string>('database.user'),
        password: config.get<string>('database.password'),
        autoLoadEntities: true,
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
      }),
    }),

    // 业务模块
    AuthModule,
    WatchlistModule,
    MarketDataModule,
    NewsIntelModule,
    AiGatewayModule,
    AnalyticsModule,
    AlertingModule,
    JobsModule,
    HealthModule,
  ],
})
export class AppModule {}
