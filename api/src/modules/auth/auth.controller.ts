// 认证控制器
import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateLlmConfigDto, UpdateLlmConfigDto } from './dto/llm-config.dto';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return ApiResponse.ok(result, '注册成功');
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return ApiResponse.ok(result, '登录成功');
  }

  // ---- LLM 配置管理 ----

  @Get('llm-configs')
  @UseGuards(JwtAuthGuard)
  async getLlmConfigs(@CurrentUser('id') userId: string) {
    const configs = await this.authService.getLlmConfigs(userId);
    return ApiResponse.ok(configs);
  }

  @Post('llm-configs')
  @UseGuards(JwtAuthGuard)
  async createLlmConfig(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLlmConfigDto,
  ) {
    const config = await this.authService.createLlmConfig(userId, dto);
    return ApiResponse.ok(config, '配置已保存');
  }

  @Patch('llm-configs/:id')
  @UseGuards(JwtAuthGuard)
  async updateLlmConfig(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLlmConfigDto,
  ) {
    const config = await this.authService.updateLlmConfig(userId, id, dto);
    return ApiResponse.ok(config, '配置已更新');
  }

  @Delete('llm-configs/:id')
  @UseGuards(JwtAuthGuard)
  async deleteLlmConfig(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.authService.deleteLlmConfig(userId, id);
    return ApiResponse.ok(null, '配置已删除');
  }
}
