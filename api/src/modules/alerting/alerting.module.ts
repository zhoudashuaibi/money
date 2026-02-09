// 预警模块
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertRule } from './entities/alert-rule.entity';
import { AlertingService } from './alerting.service';
import { AlertingController } from './alerting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlertRule])],
  controllers: [AlertingController],
  providers: [AlertingService],
  exports: [AlertingService],
})
export class AlertingModule {}
