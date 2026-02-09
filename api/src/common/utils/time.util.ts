// 时间工具函数
/**
 * 判断当前是否为 A 股交易时间（北京时间 9:30-11:30, 13:00-15:00）
 */
export function isCNTradingHours(): boolean {
  const now = new Date();
  const bjHour = (now.getUTCHours() + 8) % 24;
  const bjMin = now.getUTCMinutes();
  const t = bjHour * 60 + bjMin;
  return (t >= 570 && t <= 690) || (t >= 780 && t <= 900);
}

/**
 * 获取北京时间的日期字符串 YYYY-MM-DD
 */
export function getBJDateStr(): string {
  const now = new Date();
  const bjTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return bjTime.toISOString().slice(0, 10);
}

/**
 * 延迟指定毫秒
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
