// 预警服务
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertRule } from './entities/alert-rule.entity';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertingService {
  constructor(
    @InjectRepository(AlertRule)
    private alertRepo: Repository<AlertRule>,
  ) {}

  async create(userId: string, dto: CreateAlertDto) {
    const entity = this.alertRepo.create({ userId, ...dto });
    return this.alertRepo.save(entity);
  }

  async findByUser(userId: string) {
    return this.alertRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async toggle(userId: string, id: string) {
    const rule = await this.alertRepo.findOne({ where: { id, userId } });
    if (!rule) return null;
    rule.enabled = !rule.enabled;
    return this.alertRepo.save(rule);
  }

  async remove(userId: string, id: string) {
    await this.alertRepo.delete({ id, userId });
  }
}
