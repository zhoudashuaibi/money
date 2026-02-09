// AI 分析请求 DTO
import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class AnalysisRequestDto {
  @IsString()
  symbol: string;

  @IsOptional()
  @IsString()
  market?: string;

  @IsOptional()
  @IsArray()
  agents?: string[];

  /** 用户自定义 LLM 配置 ID，不传则使用系统默认 */
  @IsOptional()
  @IsUUID()
  llmConfigId?: string;
}
