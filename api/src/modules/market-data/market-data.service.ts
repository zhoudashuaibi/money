// 行情数据服务 - 对接 AkShare Sidecar
import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { QuoteSnapshot } from './entities/quote-snapshot.entity';
import { inferMarket } from '../../common/utils/symbol.util';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly sidecarBaseUrl: string;
  private readonly timeoutMs: number;

  constructor(
    private configService: ConfigService,
    @InjectRepository(QuoteSnapshot)
    private quoteRepo: Repository<QuoteSnapshot>,
  ) {
    this.sidecarBaseUrl = this.configService.get<string>('akshare.baseUrl') || 'http://localhost:8001/v1';
    this.timeoutMs = this.configService.get<number>('akshare.timeoutMs') ?? 8000;
  }

  /** 从 Sidecar 获取实时行情 */
  async getRealtimeQuote(symbol: string) {
    const market = inferMarket(symbol);
    try {
      const { data } = await axios.get(
        `${this.sidecarBaseUrl}/quote/realtime`,
        { params: { symbol, market }, timeout: this.timeoutMs },
      );
      return data;
    } catch (err) {
      this.logger.error(`获取行情失败: ${symbol}`, err.message);
      throw new HttpException('行情数据获取失败', 502);
    }
  }

  /** 从 Sidecar 获取 K 线数据 */
  async getKline(symbol: string, period = 'daily', count = 120) {
    try {
      const { data } = await axios.get(
        `${this.sidecarBaseUrl}/quote/kline`,
        { params: { symbol, period, count }, timeout: this.timeoutMs },
      );
      return data;
    } catch (err) {
      this.logger.error(`获取K线失败: ${symbol}`, err.message);
      throw new HttpException('K线数据获取失败', 502);
    }
  }

  /** 保存行情快照到数据库 */
  async saveSnapshot(snapshot: Partial<QuoteSnapshot>) {
    const entity = this.quoteRepo.create(snapshot);
    return this.quoteRepo.save(entity);
  }
}
