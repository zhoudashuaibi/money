// 行情数据控制器
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('market-data')
@UseGuards(JwtAuthGuard)
export class MarketDataController {
  constructor(private marketDataService: MarketDataService) {}

  @Get('quote')
  async getQuote(@Query('symbol') symbol: string) {
    const data = await this.marketDataService.getRealtimeQuote(symbol);
    return ApiResponse.ok(data);
  }

  @Get('kline')
  async getKline(
    @Query('symbol') symbol: string,
    @Query('period') period?: string,
    @Query('count') count?: number,
  ) {
    const data = await this.marketDataService.getKline(symbol, period, count);
    return ApiResponse.ok(data);
  }
}
