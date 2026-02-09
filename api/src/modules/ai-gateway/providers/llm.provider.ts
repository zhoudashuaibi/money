// LLM 提供商抽象接口与 OpenAI 兼容实现
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmResponse {
  content: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number };
}

export interface LlmCustomConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

@Injectable()
export class LlmProvider {
  private readonly logger = new Logger(LlmProvider.name);

  constructor(private configService: ConfigService) {}

  /** 调用 OpenAI 兼容接口，支持自定义配置覆盖 */
  async chat(
    messages: LlmMessage[],
    provider?: string,
    customConfig?: LlmCustomConfig,
  ): Promise<LlmResponse> {
    // 如果传入了自定义配置，直接使用
    if (customConfig) {
      return this.callApi(messages, customConfig);
    }

    const providers = this.configService.get<string[]>('llm.providerPriority') ?? ['openai'];
    const target = provider || providers[0];
    const config = this.getProviderConfig(target);

    try {
      return await this.callApi(messages, config);
    } catch (err) {
      this.logger.error(`LLM 调用失败 [${target}]: ${err.message}`);
      const idx = providers.indexOf(target);
      if (idx < providers.length - 1) {
        this.logger.warn(`降级到 ${providers[idx + 1]}`);
        return this.chat(messages, providers[idx + 1]);
      }
      throw err;
    }
  }

  private async callApi(messages: LlmMessage[], config: LlmCustomConfig): Promise<LlmResponse> {
    const { data } = await axios.post(
      `${config.baseUrl}/chat/completions`,
      { model: config.model, messages, temperature: 0.3 },
      {
        headers: { Authorization: `Bearer ${config.apiKey}` },
        timeout: 30000,
      },
    );
    const choice = data.choices[0];
    return {
      content: choice.message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
      },
    };
  }

  private getProviderConfig(provider: string) {
    const conf = this.configService.get(`llm.${provider}`);
    return {
      apiKey: conf?.apiKey || '',
      baseUrl: conf?.baseUrl || 'https://api.openai.com/v1',
      model: conf?.model || 'gpt-4o-mini',
    };
  }
}
