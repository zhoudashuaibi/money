"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { WatchlistItem } from "@/types";

/** 获取自选股列表 */
export function useWatchlist() {
  return useQuery<WatchlistItem[]>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const { data } = await api.get("/watchlist");
      return data.data;
    },
  });
}

/** 添加自选股 */
export function useAddWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { symbol: string; name: string; market: string }) => {
      const { data } = await api.post("/watchlist", item);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

/** 删除自选股 */
export function useRemoveWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/watchlist/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}
