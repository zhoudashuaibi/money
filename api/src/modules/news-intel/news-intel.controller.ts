// 新闻情报控制器
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NewsIntelService } from './news-intel.service';
import { NewsSearchDto } from './dto/news-search.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('news')
@UseGuards(JwtAuthGuard)
export class NewsIntelController {
  constructor(private newsIntelService: NewsIntelService) {}

  @Get('search')
  async search(@Query() dto: NewsSearchDto) {
    const data = await this.newsIntelService.searchNews(dto);
    return ApiResponse.ok(data);
  }

  @Get('history')
  async history(
    @Query('symbol') symbol: string,
    @Query('limit') limit?: number,
  ) {
    const articles = await this.newsIntelService.findBySymbol(symbol, limit);
    return ApiResponse.ok(articles);
  }
}
