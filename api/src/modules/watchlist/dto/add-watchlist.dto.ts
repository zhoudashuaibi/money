// 添加自选股 DTO
import { IsString, MaxLength } from 'class-validator';

export class AddWatchlistDto {
  @IsString()
  @MaxLength(20)
  symbol: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(10)
  market: string;
}
