// LLM 配置 DTO
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateLlmConfigDto {
  @IsString()
  @MaxLength(50)
  providerName: string;

  @IsString()
  @MaxLength(500)
  apiKey: string;

  @IsString()
  @MaxLength(500)
  baseUrl: string;

  @IsString()
  @MaxLength(100)
  model: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateLlmConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  providerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  apiKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  baseUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
