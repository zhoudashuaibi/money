// AI 分析请求 DTO
import { IsString, IsOptional, IsArray } from 'class-validator';

export class AnalysisRequestDto {
  @IsString()
  symbol: string;

  @IsOptional()
  @IsString()
  market?: string;

  @IsOptional()
  @IsArray()
  agents?: string[];
}
