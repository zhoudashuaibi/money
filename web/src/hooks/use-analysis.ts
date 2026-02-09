"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AnalysisRecord, PageResult } from "@/types";

/** 单次 Agent 结果 */
export interface AgentResult {
  agent: string;
  content: string;
  usage: { promptTokens: number; completionTokens: number };
}

/** 分析接口返回 */
export interface AnalysisResponse {
  id: string;
  results: AgentResult[];
}

/** 触发 AI 分析 */
export function useRunAnalysis() {
  return useMutation({
    mutationFn: async (symbol: string) => {
      const { data } = await api.post("/ai/analyze", { symbol });
      return data.data as AnalysisResponse;
    },
  });
}

/** 获取分析历史列表 */
export function useAnalysisList(page = 1, pageSize = 10) {
  return useQuery<PageResult<AnalysisRecord>>({
    queryKey: ["analysis-list", page, pageSize],
    queryFn: async () => {
      const { data } = await api.get("/analytics", {
        params: { page, pageSize },
      });
      return data.data;
    },
  });
}

/** 获取单条分析详情 */
export function useAnalysisDetail(id: string | null) {
  return useQuery<AnalysisRecord>({
    queryKey: ["analysis-detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
