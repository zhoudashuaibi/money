// 新闻情报服务 - 对接 Tavily Search API
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { NewsArticle } from './entities/news-article.entity';
import { NewsSearchDto } from './dto/news-search.dto';

@Injectable()
export class NewsIntelService {
  private readonly logger = new Logger(NewsIntelService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(NewsArticle)
    private newsRepo: Repository<NewsArticle>,
  ) {
    this.apiKey = this.configService.get<string>('tavily.apiKey') || '';
    this.baseUrl = this.configService.get<string>('tavily.baseUrl') || 'https://api.tavily.com';
  }

  /** 通过 Tavily 搜索新闻 - 支持用户自定义配置 */
  async searchNews(
    dto: NewsSearchDto,
    userTavilyConfig?: { apiKey: string; baseUrl?: string },
  ) {
    // 优先使用用户配置，否则回退到系统配置
    const apiKey = userTavilyConfig?.apiKey || this.apiKey;
    const baseUrl = userTavilyConfig?.baseUrl || this.baseUrl;

    if (!apiKey) {
      this.logger.warn('Tavily API Key 未配置，跳过新闻搜索');
      return { results: [], answer: '' };
    }

    try {
      const { data } = await axios.post(
        `${baseUrl}/search`,
        {
          api_key: apiKey,
          query: dto.query,
          search_depth: 'basic',
          max_results: dto.maxResults || 5,
          include_answer: true,
          topic: 'news',
        },
        { timeout: 10000 },
      );
      return data;
    } catch (err) {
      this.logger.error(`Tavily 搜索失败: ${dto.query}`, err.message);
      return { results: [], answer: '' };
    }
  }

  /** 保存新闻到数据库 */
  async saveArticle(article: Partial<NewsArticle>) {
    const entity = this.newsRepo.create(article);
    return this.newsRepo.save(entity);
  }

  /** 按股票代码查询历史新闻 */
  async findBySymbol(symbol: string, limit = 20) {
    return this.newsRepo.find({
      where: { symbol },
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }
}
