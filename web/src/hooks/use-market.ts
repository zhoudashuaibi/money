"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Quote, KlineItem } from "@/types";

/** 获取实时行情 */
export function useQuote(symbol: string | null) {
  return useQuery<Quote>({
    queryKey: ["quote", symbol],
    queryFn: async () => {
      const { data } = await api.get("/market-data/quote", {
        params: { symbol },
      });
      return data.data;
    },
    enabled: !!symbol,
    refetchInterval: 5000,
  });
}

/** 获取 K 线数据 */
export function useKline(
  symbol: string | null,
  period = "daily",
  count = 120
) {
  return useQuery<KlineItem[]>({
    queryKey: ["kline", symbol, period, count],
    queryFn: async () => {
      const { data } = await api.get("/market-data/kline", {
        params: { symbol, period, count },
      });
      return data.data;
    },
    enabled: !!symbol,
  });
}
