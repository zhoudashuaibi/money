// 分析记录控制器
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalysisQueryDto } from './dto/analysis-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get()
  async list(
    @CurrentUser('id') userId: string,
    @Query() query: AnalysisQueryDto,
  ) {
    const data = await this.analyticsService.findByUser(userId, query);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const record = await this.analyticsService.findOne(id);
    return ApiResponse.ok(record);
  }
}
