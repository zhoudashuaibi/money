// 全局配置工厂
export default () => ({
  port: parseInt(process.env.APP_PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME || 'invest_mvp',
    user: process.env.DB_USER || 'invest_user',
    password: process.env.DB_PASSWORD || 'changeme',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  akshare: {
    baseUrl: process.env.AKSHARE_SIDECAR_BASE_URL || 'http://localhost:8001/v1',
    timeoutMs: parseInt(process.env.AKSHARE_TIMEOUT_MS ?? '8000', 10),
  },
  tavily: {
    apiKey: process.env.TAVILY_API_KEY || '',
    baseUrl: process.env.TAVILY_BASE_URL || 'https://api.tavily.com',
    monthlyBudget: parseInt(process.env.TAVILY_MONTHLY_BUDGET ?? '1000', 10),
  },
  llm: {
    providerPriority: (process.env.LLM_PROVIDER_PRIORITY || 'openai,gemini').split(','),
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    },
  },
});
