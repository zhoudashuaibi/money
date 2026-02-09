// 股票代码工具函数
/**
 * 判断是否为 A 股代码（6位数字）
 */
export function isAShareSymbol(symbol: string): boolean {
  return /^\d{6}$/.test(symbol);
}

/**
 * 判断是否为港股代码（5位数字）
 */
export function isHKSymbol(symbol: string): boolean {
  return /^\d{5}$/.test(symbol);
}

/**
 * 判断是否为美股代码（1-5位字母）
 */
export function isUSSymbol(symbol: string): boolean {
  return /^[A-Z]{1,5}$/.test(symbol);
}

/**
 * 根据代码推断市场
 */
export function inferMarket(symbol: string): 'CN' | 'HK' | 'US' | 'UNKNOWN' {
  if (isAShareSymbol(symbol)) return 'CN';
  if (isHKSymbol(symbol)) return 'HK';
  if (isUSSymbol(symbol)) return 'US';
  return 'UNKNOWN';
}
