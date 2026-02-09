// 行情查询 DTO
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class QuoteQueryDto {
  @IsString()
  @MaxLength(20)
  symbol: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  market?: string;
}
