// 新闻情报模块
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsArticle } from './entities/news-article.entity';
import { NewsIntelService } from './news-intel.service';
import { NewsIntelController } from './news-intel.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NewsArticle])],
  controllers: [NewsIntelController],
  providers: [NewsIntelService],
  exports: [NewsIntelService],
})
export class NewsIntelModule {}
