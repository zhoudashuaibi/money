// AI 网关服务 - 串行 Agent 编排
import { Injectable, Logger } from '@nestjs/common';
import { LlmProvider, LlmMessage, LlmCustomConfig } from './providers/llm.provider';
import { MarketDataService } from '../market-data/market-data.service';
import { NewsIntelService } from '../news-intel/news-intel.service';
import { AuthService } from '../auth/auth.service';

export interface AgentResult {
  agent: string;
  content: string;
  usage: { promptTokens: number; completionTokens: number };
}

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);

  constructor(
    private llmProvider: LlmProvider,
    private marketDataService: MarketDataService,
    private newsIntelService: NewsIntelService,
    private authService: AuthService,
  ) {}

  /** MVP 串行分析流：技术分析 → 舆情分析 → 综合决策 */
  async runAnalysis(
    symbol: string,
    userId?: string,
    customConfig?: LlmCustomConfig,
  ): Promise<AgentResult[]> {
    const results: AgentResult[] = [];

    // 0. 查询用户 Tavily 配置（如果有 userId）
    let userTavilyConfig: { apiKey: string; baseUrl?: string } | undefined;
    if (userId) {
      const tavilyConfig = await this.authService.getLlmConfigByProvider(userId, 'tavily');
      if (tavilyConfig) {
        userTavilyConfig = { apiKey: tavilyConfig.apiKey, baseUrl: tavilyConfig.baseUrl };
        this.logger.log(`使用用户 ${userId} 的 Tavily 配置`);
      }
    }

    // 1. 获取行情数据
    const quote = await this.marketDataService.getRealtimeQuote(symbol);
    const kline = await this.marketDataService.getKline(symbol, 'daily', 60);

    // 2. Agent-1: 技术分析
    const techResult = await this.runTechnicalAgent(symbol, quote, kline, customConfig);
    results.push(techResult);

    // 3. 获取新闻（使用用户 Tavily 配置）
    const news = await this.newsIntelService.searchNews(
      {
        query: `${symbol} 股票 最新消息`,
        symbol,
        maxResults: 5,
      },
      userTavilyConfig,
    );

    // 4. Agent-2: 舆情分析
    const sentimentResult = await this.runSentimentAgent(symbol, news, customConfig);
    results.push(sentimentResult);

    // 5. 综合决策
    const decisionResult = await this.runDecisionAgent(
      symbol,
      techResult.content,
      sentimentResult.content,
      customConfig,
    );
    results.push(decisionResult);

    return results;
  }

  private async runTechnicalAgent(
    symbol: string,
    quote: any,
    kline: any,
    customConfig?: LlmCustomConfig,
  ): Promise<AgentResult> {
    const messages: LlmMessage[] = [
      {
        role: 'system',
        content:
          '你是一位专业的股票技术分析师。根据提供的行情和K线数据，给出技术面分析。包括趋势判断、支撑/阻力位、关键技术指标信号。用中文回答，简洁专业。',
      },
      {
        role: 'user',
        content: `请分析 ${symbol} 的技术面：\n实时行情：${JSON.stringify(quote)}\n近60日K线：${JSON.stringify(kline)}`,
      },
    ];
    const resp = await this.llmProvider.chat(messages, undefined, customConfig);
    return { agent: 'technical', content: resp.content, usage: resp.usage };
  }

  private async runSentimentAgent(
    symbol: string,
    news: any,
    customConfig?: LlmCustomConfig,
  ): Promise<AgentResult> {
    const messages: LlmMessage[] = [
      {
        role: 'system',
        content:
          '你是一位金融舆情分析师。根据提供的新闻数据，分析市场情绪和舆论倾向。给出情绪评分（-1到1）和关键观点摘要。用中文回答。',
      },
      {
        role: 'user',
        content: `请分析 ${symbol} 的舆情：\n新闻数据：${JSON.stringify(news)}`,
      },
    ];
    const resp = await this.llmProvider.chat(messages, undefined, customConfig);
    return { agent: 'sentiment', content: resp.content, usage: resp.usage };
  }

  private async runDecisionAgent(
    symbol: string,
    techAnalysis: string,
    sentimentAnalysis: string,
    customConfig?: LlmCustomConfig,
  ): Promise<AgentResult> {
    const messages: LlmMessage[] = [
      {
        role: 'system',
        content:
          '你是一位投资决策顾问。综合技术分析和舆情分析结果，给出投资建议。包括：操作建议（买入/持有/卖出）、信心指数（0-100）、风险提示。用中文回答。声明：仅供参考，不构成投资建议。',
      },
      {
        role: 'user',
        content: `请综合分析 ${symbol}：\n技术分析：${techAnalysis}\n舆情分析：${sentimentAnalysis}`,
      },
    ];
    const resp = await this.llmProvider.chat(messages, undefined, customConfig);
    return { agent: 'decision', content: resp.content, usage: resp.usage };
  }
}
