"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { LlmConfig } from "@/types";

const QUERY_KEY = "llm-configs";

/** 获取用户 LLM 配置列表 */
export function useLlmConfigs() {
  return useQuery<LlmConfig[]>({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data } = await api.get("/auth/llm-configs");
      return data.data;
    },
  });
}

/** 新增 LLM 配置 */
export function useCreateLlmConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      providerName: string;
      apiKey: string;
      baseUrl: string;
      model: string;
      isDefault?: boolean;
    }) => {
      const { data } = await api.post("/auth/llm-configs", payload);
      return data.data as LlmConfig;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

/** 更新 LLM 配置 */
export function useUpdateLlmConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      providerName?: string;
      apiKey?: string;
      baseUrl?: string;
      model?: string;
      isDefault?: boolean;
    }) => {
      const { data } = await api.patch(`/auth/llm-configs/${id}`, payload);
      return data.data as LlmConfig;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

/** 删除 LLM 配置 */
export function useDeleteLlmConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/auth/llm-configs/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
