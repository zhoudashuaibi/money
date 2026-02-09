// AI 网关控制器
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiGatewayService } from './ai-gateway.service';
import { AnalysisRequestDto } from './dto/analysis-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiGatewayController {
  constructor(
    private aiGatewayService: AiGatewayService,
    private analyticsService: AnalyticsService,
  ) {}

  @Post('analyze')
  async analyze(
    @Body() dto: AnalysisRequestDto,
    @CurrentUser('id') userId: string,
  ) {
    const results = await this.aiGatewayService.runAnalysis(dto.symbol);

    // 提取决策结果
    const decision = results.find((r) => r.agent === 'decision');
    const totalTokens = results.reduce(
      (sum, r) => sum + r.usage.promptTokens + r.usage.completionTokens,
      0,
    );

    // 持久化分析记录
    const record = await this.analyticsService.save({
      userId,
      symbol: dto.symbol,
      agentResults: Object.fromEntries(results.map((r) => [r.agent, r.content])),
      recommendation: decision?.content?.slice(0, 500) || '',
      confidenceScore: 0,
      totalTokens,
    });

    return ApiResponse.ok({ id: record.id, results }, '分析完成');
  }
}
