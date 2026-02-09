// 分析记录查询 DTO
import { IsOptional, IsString } from 'class-validator';
import { PageQueryDto } from '../../../common/dto/page-query.dto';

export class AnalysisQueryDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  symbol?: string;
}
