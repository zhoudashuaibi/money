// 分析记录服务
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalysisRecord } from './entities/analysis-record.entity';
import { AnalysisQueryDto } from './dto/analysis-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalysisRecord)
    private recordRepo: Repository<AnalysisRecord>,
  ) {}

  /** 保存分析记录 */
  async save(record: Partial<AnalysisRecord>) {
    const entity = this.recordRepo.create(record);
    return this.recordRepo.save(entity);
  }

  /** 分页查询用户的分析记录 */
  async findByUser(userId: string, query: AnalysisQueryDto) {
    const qb = this.recordRepo
      .createQueryBuilder('r')
      .where('r.userId = :userId', { userId });

    if (query.symbol) {
      qb.andWhere('r.symbol = :symbol', { symbol: query.symbol });
    }

    const [items, total] = await qb
      .orderBy('r.createdAt', 'DESC')
      .skip(((query.page || 1) - 1) * (query.limit || 20))
      .take(query.limit || 20)
      .getManyAndCount();

    return { items, total, page: query.page, limit: query.limit };
  }

  /** 获取单条分析详情 */
  async findOne(id: string) {
    return this.recordRepo.findOne({ where: { id } });
  }
}
