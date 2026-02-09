// 行情数据类型
export interface Quote {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  volume: number;
  amount: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
}

// K线数据
export interface KlineItem {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
}

// 用户
export interface User {
  id: string;
  email: string;
  nickname: string;
  role: string;
}

// 自选股
export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  market: string;
  sortOrder: number;
}

// 分析记录
export interface AnalysisRecord {
  id: string;
  symbol: string;
  agentResults: Record<string, unknown>;
  recommendation: string;
  confidenceScore: number;
  totalTokens: number;
  createdAt: string;
}

// 预警规则
export interface AlertRule {
  id: string;
  symbol: string;
  conditionType: string;
  thresholdValue: number;
  enabled: boolean;
}

// 通用分页
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
