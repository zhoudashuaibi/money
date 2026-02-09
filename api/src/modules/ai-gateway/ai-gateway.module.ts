// AI 网关模块
import { Module } from '@nestjs/common';
import { AiGatewayService } from './ai-gateway.service';
import { AiGatewayController } from './ai-gateway.controller';
import { LlmProvider } from './providers/llm.provider';
import { MarketDataModule } from '../market-data/market-data.module';
import { NewsIntelModule } from '../news-intel/news-intel.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MarketDataModule, NewsIntelModule, AnalyticsModule, AuthModule],
  controllers: [AiGatewayController],
  providers: [AiGatewayService, LlmProvider],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
