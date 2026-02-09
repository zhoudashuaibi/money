import { create } from "zustand";
import type { Quote, WatchlistItem } from "@/types";

interface MarketState {
  // 当前选中的股票
  activeSymbol: string | null;
  activeQuote: Quote | null;
  // 自选股列表
  watchlist: WatchlistItem[];
  // 操作
  setActiveSymbol: (symbol: string) => void;
  setActiveQuote: (quote: Quote) => void;
  setWatchlist: (list: WatchlistItem[]) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  activeSymbol: null,
  activeQuote: null,
  watchlist: [],

  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
  setActiveQuote: (quote) => set({ activeQuote: quote }),
  setWatchlist: (list) => set({ watchlist: list }),
}));
