// 创建预警规则 DTO
import { IsString, IsNumber, IsIn, MaxLength } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  @MaxLength(20)
  symbol: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsIn(['price_above', 'price_below', 'change_pct_above', 'change_pct_below'])
  conditionType: string;

  @IsNumber()
  thresholdValue: number;
}
