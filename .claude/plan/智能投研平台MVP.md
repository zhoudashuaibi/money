# 智能投研平台 MVP 实施计划（方案A：轻量快跑型）

> 由 Claude Opus 4 综合 Codex（后端）+ Gemini（前端）规划生成

## 1. 方案概述

- **方案**：轻量快跑型（方案A）
- **目标**：A股优先、分钟级信号、仅决策支持、不接实盘
- **技术栈**：Next.js + shadcn/ui（前端）| NestJS 单体 + Python Sidecar（后端）
- **数据来源**：AkShare（A股行情）+ Tavily（新闻搜索）
- **智能体**：2个串行（技术面 → 舆情）
- **部署**：Docker Compose

---

## 2. 系统架构总览

```
┌─────────────────────────────────────────────────┐
│                   前端 (Next.js)                 │
│  App Router + shadcn/ui + ECharts + Zustand     │
│  轮询 (React Query refetchInterval)             │
└──────────────────────┬──────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────┐
│              NestJS API (单体模块化)              │
│  auth | watchlist | market-data | news-intel    │
│  ai-gateway | analytics | alerting | jobs       │
└───┬──────────┬──────────┬───────────────────────┘
    │          │          │
    ▼          ▼          ▼
┌──────┐ ┌────────┐ ┌──────────────────┐
│ PG   │ │ Redis  │ │ AkShare Sidecar  │
│      │ │ BullMQ │ │ (FastAPI/Python)  │
└──────┘ └────────┘ └──────────────────┘
```

---

## 3. 后端架构（Codex 规划，采纳）

### 3.1 NestJS 模块划分

| 模块 | 职责 |
|------|------|
| `auth` | JWT 登录、刷新、管理员建用户、首次改密、RBAC |
| `watchlist` | 自选股分组、增删改查、关注参数 |
| `market-data` | 调用 AkShare Sidecar，行情标准化、缓存、落库 |
| `news-intel` | 调用 Tavily，新闻抓取、去重、情绪打分 |
| `ai-gateway` | 封装 OpenAI/Gemini 兼容调用与容错 |
| `analytics` | 技术面 Agent、舆情 Agent、串行编排、融合输出 |
| `alerting` | 规则触发、告警事件记录 |
| `jobs` | BullMQ 队列消费与定时调度 |

### 3.2 Python AkShare Sidecar 端点

| 端点 | 用途 |
|------|------|
| `GET /v1/health` | 健康检查 |
| `GET /v1/market/snapshot` | 最新行情快照 |
| `GET /v1/market/bars` | K线数据（1m/5m/15m/1d） |
| `GET /v1/market/trading-calendar` | 交易日历 |
| `GET /v1/stock/profile` | 证券基本信息 |

### 3.3 核心 API 端点

**认证**
- `POST /api/v1/auth/login` — 登录
- `POST /api/v1/auth/refresh` — 刷新 Token
- `POST /api/v1/auth/first-login/reset-password` — 首次改密
- `POST /api/v1/admin/users` — 管理员创建用户

**自选股**
- `GET/POST /api/v1/watchlists` — 自选股列表 CRUD
- `POST/DELETE /api/v1/watchlists/:id/items` — 自选股项管理

**行情**
- `GET /api/v1/market/snapshot?symbols=...` — 实时快照
- `GET /api/v1/market/bars?symbol=...&interval=1m` — K线数据

**新闻与舆情**
- `GET /api/v1/news?symbol=...` — 新闻列表
- `GET /api/v1/sentiment?symbol=...` — 情绪评分

**分析与决策**
- `POST /api/v1/analysis/runs` — 触发分析
- `GET /api/v1/dashboard/decision?symbol=...` — 决策仪表盘（核心）

**告警**
- `GET/POST /api/v1/alerts/rules` — 告警规则 CRUD
- `GET /api/v1/alerts/events` — 告警事件

### 3.4 数据库核心表（PostgreSQL）

| 表名 | 用途 | 关键字段 |
|------|------|---------|
| `users` | 用户管理 | id, username, password_hash, role, must_reset_password |
| `instruments` | 证券标的 | symbol, market, name, industry |
| `watchlists` | 自选股分组 | user_id, name |
| `watchlist_items` | 自选股项 | watchlist_id, instrument_id, target_price, stop_loss |
| `market_bars_1m` | 分钟K线 | symbol, bar_time, OHLCV |
| `news_articles` | 新闻文章 | symbol, title, url, content_hash |
| `sentiment_scores` | 情绪评分 | symbol, news_article_id, sentiment_label, score |
| `analysis_runs` | 分析任务 | symbol, status, trigger_type |
| `analysis_signals` | 分析结论 | run_id, core_conclusion, confidence, checklist(JSONB) |
| `alert_rules` | 告警规则 | user_id, symbol, rule_type, rule_params |
| `alert_events` | 告警事件 | rule_id, symbol, event_type, payload |

> 完整 DDL 见 Codex 输出的架构蓝图文档

---

## 4. 前端架构（Gemini 规划，采纳）

### 4.1 页面路由设计

```
app/
├── (auth)/
│   ├── layout.tsx          # 居中卡片布局
│   └── login/page.tsx      # 登录页
├── (dashboard)/
│   ├── layout.tsx          # Sidebar + Header 持久化布局
│   ├── page.tsx            # AI 决策仪表盘（首页）
│   ├── market/page.tsx     # 市场总览
│   ├── watchlist/
│   │   ├── page.tsx        # 自选股列表
│   │   └── [tickerId]/page.tsx  # 个股详情
│   └── news/page.tsx       # 新闻与情绪
└── layout.tsx              # Root Layout (Providers)
```

### 4.2 状态管理方案

| 状态类型 | 工具 | 内容 |
|---------|------|------|
| 服务端状态 | React Query | K线数据、AI报告、新闻列表、用户信息 |
| 全局UI状态 | Zustand | theme、sidebarOpen、activeSymbol |
| 本地状态 | useState | 表单输入、图表时间范围、模态框开关 |

**轮询策略**（MVP 用轮询代替 WebSocket）：
- 仪表盘：10s 轮询
- 市场总览：5s 轮询
- 个股详情：3s 轮询
- 新闻：SSR + 手动刷新

### 4.3 AI 决策仪表盘组件树

```
DashboardPage
├── MarketOverview (上证/深证/创业板 指数卡片)
├── AIInsightPanel (核心决策区)
│   ├── DecisionHeader (买入/卖出 Badge + 置信度)
│   ├── KeyReasoning (AI 分析文本)
│   └── ExecutionChecklist (操作检查清单)
├── TradeSignalCard (买入价/止损价/目标价)
├── RiskWarningCard (反例风险提示)
└── WatchlistPreview (自选股速览表格)
```

---

## 5. 实施步骤（按优先级排序）

### P0：基础骨架（必须先做）

| 步骤 | 任务 | 产出 |
|------|------|------|
| 1 | 初始化 NestJS 项目 + 基础模块骨架 | 可运行的空项目 |
| 2 | PostgreSQL 核心表 + 迁移脚本 | 11 张核心表 |
| 3 | 搭建 AkShare Sidecar（FastAPI） | health/snapshot/bars 端点 |
| 4 | NestJS market-data 模块对接 Sidecar | 行情采集入库链路 |
| 5 | 初始化 Next.js + shadcn/ui 前端项目 | 可运行的前端骨架 |
| 6 | 前端 Dashboard Layout（Sidebar+Header） | 基础布局 |

### P1：核心功能闭环

| 步骤 | 任务 | 产出 |
|------|------|------|
| 7 | 接入 Tavily + 新闻去重落库 | news-intel 模块 |
| 8 | AI Gateway（OpenAI/Gemini 兼容） | 统一 LLM 调用层 |
| 9 | 串行分析流程（技术面→舆情→融合） | analytics 模块 |
| 10 | 决策仪表盘 API（结论+点位+清单） | GET /dashboard/decision |
| 11 | 前端 ECharts 封装 + K线组件 | BaseChart + KLineChart |
| 12 | 前端 AI 决策仪表盘页面 | 核心页面完成 |
| 13 | 前端自选股 CRUD + 个股详情 | watchlist 页面 |
| 14 | 用户认证（登录+首次改密） | auth 全流程 |

### P2：增强与上线

| 步骤 | 任务 | 产出 |
|------|------|------|
| 15 | Redis 缓存（行情快照、新闻） | 性能提升 |
| 16 | BullMQ 异步任务（采集/分析） | 任务队列 |
| 17 | 告警规则与事件 | alerting 模块 |
| 18 | Tavily 配额治理（日预算+优先级） | 配额管理 |
| 19 | 前端市场总览 + 新闻情绪页面 | 剩余页面 |
| 20 | Docker Compose 编排 + 部署验证 | 一键部署 |

---

## 6. Docker Compose 服务编排

| 服务 | 镜像/构建 | 端口 | 依赖 |
|------|----------|------|------|
| `api` | NestJS 构建 | 3000 | postgres, redis, akshare-sidecar |
| `worker` | 同 api 镜像，不同启动命令 | — | postgres, redis |
| `akshare-sidecar` | FastAPI 构建 | 8001 | — |
| `postgres` | postgres:15 | 5432 | — |
| `redis` | redis:7 | 6379 | — |
| `web` | Next.js 构建 | 3001 | api |

---

## 7. 环境变量清单

| 分类 | 变量 | 示例值 |
|------|------|--------|
| 基础 | `NODE_ENV` | development |
| 基础 | `TZ` | Asia/Shanghai |
| API | `APP_PORT` | 3000 |
| JWT | `JWT_ACCESS_SECRET` | *** |
| JWT | `JWT_ACCESS_EXPIRES` | 15m |
| 数据库 | `DB_HOST` / `DB_PORT` / `DB_NAME` | postgres / 5432 / invest_mvp |
| Redis | `REDIS_HOST` / `REDIS_PORT` | redis / 6379 |
| Sidecar | `AKSHARE_SIDECAR_BASE_URL` | http://akshare-sidecar:8001/v1 |
| Tavily | `TAVILY_API_KEY` | *** |
| Tavily | `TAVILY_MONTHLY_BUDGET` | 1000 |
| LLM | `LLM_PROVIDER_PRIORITY` | openai,gemini |
| LLM | `OPENAI_API_KEY` / `OPENAI_MODEL` | *** / gpt-4o-mini |
| LLM | `GEMINI_API_KEY` / `GEMINI_MODEL` | *** / gemini-1.5-flash |

---

## 8. 关键风险与对策

| 风险 | 对策 |
|------|------|
| AkShare 接口不稳定 | Sidecar 隔离 + 重试退避 + 数据完整性校验 |
| Tavily 配额耗尽（1000次/月） | 日预算器（~33次/天）+ 缓存复用 + 关键标的优先 |
| LLM 幻觉误导 | 强制证据引用 + 规则校验 + 置信度阈值 |
| 分析串行耗时 | 超时降级（仅返回技术面或仅舆情） |
| 首次改密安全 | JWT 短时效 + RBAC 最小权限 |

---

## 9. 架构决策记录（ADR）

- **ADR-001**：AkShare 用 Python Sidecar 解耦，不用 child_process
- **ADR-002**：MVP 单体模块化，清晰边界保证后续可拆分
- **ADR-003**：智能体先串行后并行，先保证稳定再优化时延
- **ADR-004**：数据库强约束（唯一键/外键/索引），缓存仅做加速
