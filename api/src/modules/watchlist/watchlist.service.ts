// 自选股服务
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchlistItem } from './entities/watchlist-item.entity';
import { AddWatchlistDto } from './dto/add-watchlist.dto';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(WatchlistItem)
    private watchlistRepo: Repository<WatchlistItem>,
  ) {}

  async findByUser(userId: string) {
    return this.watchlistRepo.find({
      where: { userId },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async add(userId: string, dto: AddWatchlistDto) {
    const exists = await this.watchlistRepo.findOne({
      where: { userId, symbol: dto.symbol },
    });
    if (exists) throw new ConflictException('该股票已在自选列表中');

    const item = this.watchlistRepo.create({ userId, ...dto });
    return this.watchlistRepo.save(item);
  }

  async remove(userId: string, itemId: string) {
    await this.watchlistRepo.delete({ id: itemId, userId });
  }
}
