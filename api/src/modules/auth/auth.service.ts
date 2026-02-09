// 认证服务
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserLlmConfig } from './entities/user-llm-config.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateLlmConfigDto, UpdateLlmConfigDto } from './dto/llm-config.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserLlmConfig)
    private llmConfigRepo: Repository<UserLlmConfig>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('邮箱已注册');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      nickname: dto.nickname,
      passwordHash,
    });
    await this.userRepo.save(user);
    return this.buildTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('邮箱或密码错误');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('邮箱或密码错误');

    return this.buildTokens(user);
  }

  private buildTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role },
    };
  }

  // ---- LLM 配置 CRUD ----

  async getLlmConfigs(userId: string) {
    const configs = await this.llmConfigRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
    // apiKey 脱敏返回
    return configs.map((c) => ({
      ...c,
      apiKey: c.apiKey ? `${c.apiKey.slice(0, 8)}...${c.apiKey.slice(-4)}` : '',
    }));
  }

  async getLlmConfigRaw(userId: string, id: string) {
    const config = await this.llmConfigRepo.findOne({ where: { id, userId } });
    if (!config) throw new NotFoundException('配置不存在');
    return config;
  }

  async createLlmConfig(userId: string, dto: CreateLlmConfigDto) {
    if (dto.isDefault) {
      await this.llmConfigRepo.update({ userId }, { isDefault: false });
    }
    const config = this.llmConfigRepo.create({ ...dto, userId });
    return this.llmConfigRepo.save(config);
  }

  async updateLlmConfig(userId: string, id: string, dto: UpdateLlmConfigDto) {
    const config = await this.llmConfigRepo.findOne({ where: { id, userId } });
    if (!config) throw new NotFoundException('配置不存在');
    if (dto.isDefault) {
      await this.llmConfigRepo.update({ userId }, { isDefault: false });
    }
    Object.assign(config, dto);
    return this.llmConfigRepo.save(config);
  }

  async deleteLlmConfig(userId: string, id: string) {
    const config = await this.llmConfigRepo.findOne({ where: { id, userId } });
    if (!config) throw new NotFoundException('配置不存在');
    await this.llmConfigRepo.remove(config);
  }

  /** 按 providerName 获取用户配置（含完整 API Key） */
  async getLlmConfigByProvider(userId: string, providerName: string) {
    return this.llmConfigRepo.findOne({ where: { userId, providerName } });
  }
}
