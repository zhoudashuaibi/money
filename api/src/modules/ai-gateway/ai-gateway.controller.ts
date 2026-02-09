// AI 网关控制器
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiGatewayService } from './ai-gateway.service';
import { AnalysisRequestDto } from './dto/analysis-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AnalyticsService } from '../analytics/analytics.service';
import { AuthService } from '../auth/auth.service';
import { LlmCustomConfig } from './providers/llm.provider';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiGatewayController {
  constructor(
    private aiGatewayService: AiGatewayService,
    private analyticsService: AnalyticsService,
    private authService: AuthService,
  ) {}

  @Post('analyze')
  async analyze(
    @Body() dto: AnalysisRequestDto,
    @CurrentUser('id') userId: string,
  ) {
    // 如果指定了用户自定义 LLM 配置，查询完整配置
    let customConfig: LlmCustomConfig | undefined;
    if (dto.llmConfigId) {
      const llmConfig = await this.authService.getLlmConfigRaw(userId, dto.llmConfigId);
      customConfig = {
        apiKey: llmConfig.apiKey,
        baseUrl: llmConfig.baseUrl,
        model: llmConfig.model,
      };
    }

    const results = await this.aiGatewayService.runAnalysis(dto.symbol, userId, customConfig);

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
