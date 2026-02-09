// 预警控制器
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AlertingService } from './alerting.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertingController {
  constructor(private alertingService: AlertingService) {}

  @Get()
  async list(@CurrentUser('id') userId: string) {
    const items = await this.alertingService.findByUser(userId);
    return ApiResponse.ok(items);
  }

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAlertDto,
  ) {
    const rule = await this.alertingService.create(userId, dto);
    return ApiResponse.ok(rule, '创建成功');
  }

  @Patch(':id/toggle')
  async toggle(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const rule = await this.alertingService.toggle(userId, id);
    return ApiResponse.ok(rule);
  }

  @Delete(':id')
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.alertingService.remove(userId, id);
    return ApiResponse.ok(null, '删除成功');
  }
}
