// 自选股控制器
import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { AddWatchlistDto } from './dto/add-watchlist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private watchlistService: WatchlistService) {}

  @Get()
  async list(@CurrentUser('id') userId: string) {
    const items = await this.watchlistService.findByUser(userId);
    return ApiResponse.ok(items);
  }

  @Post()
  async add(
    @CurrentUser('id') userId: string,
    @Body() dto: AddWatchlistDto,
  ) {
    const item = await this.watchlistService.add(userId, dto);
    return ApiResponse.ok(item, '添加成功');
  }

  @Delete(':id')
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.watchlistService.remove(userId, id);
    return ApiResponse.ok(null, '删除成功');
  }
}
