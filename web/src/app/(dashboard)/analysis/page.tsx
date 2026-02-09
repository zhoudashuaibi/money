"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { useRunAnalysis } from "@/hooks/use-analysis";
import { useMarketStore } from "@/stores/market-store";
import { AgentResultCard } from "@/components/analysis/agent-result-card";
import type { AgentResult } from "@/hooks/use-analysis";

export default function AnalysisPage() {
  const [input, setInput] = useState("");
  const { activeSymbol } = useMarketStore();
  const analysisMutation = useRunAnalysis();

  // 优先使用输入框的值，其次使用全局 activeSymbol
  const symbol = input.trim() || activeSymbol;

  const handleAnalyze = () => {
    if (!symbol) return;
    analysisMutation.mutate(symbol);
  };

  const results: AgentResult[] = analysisMutation.data?.results ?? [];
  const totalTokens = results.reduce(
    (sum, r) => sum + r.usage.promptTokens + r.usage.completionTokens,
    0,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI 多智能体分析</h1>

      {/* 输入区域 */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder={activeSymbol || "输入股票代码，如 000001"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          className="w-56"
        />
        <Button
          onClick={handleAnalyze}
          disabled={!symbol || analysisMutation.isPending}
        >
          {analysisMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Brain className="h-4 w-4 mr-1" />
          )}
          {analysisMutation.isPending ? "分析中..." : "开始分析"}
        </Button>
        {symbol && (
          <span className="text-sm text-muted-foreground">
            当前标的：{symbol}
          </span>
        )}
      </div>

      {/* 加载状态 */}
      {analysisMutation.isPending && (
        <div className="rounded-lg border p-8 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            正在运行 3 个 AI Agent 串行分析，请稍候...
          </p>
          <p className="text-xs text-muted-foreground">
            技术面分析 → 舆情分析 → 综合决策
          </p>
        </div>
      )}

      {/* 错误提示 */}
      {analysisMutation.isError && (
        <div className="rounded-lg border border-destructive p-4 text-destructive text-sm">
          分析失败：{analysisMutation.error?.message || "未知错误"}
        </div>
      )}

      {/* 分析结果 */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">分析结果</h2>
            <span className="text-xs text-muted-foreground">
              共消耗 {totalTokens} tokens
            </span>
          </div>
          {results.map((r) => (
            <AgentResultCard key={r.agent} result={r} />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!analysisMutation.isPending &&
        results.length === 0 &&
        !analysisMutation.isError && (
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            输入股票代码并点击"开始分析"，AI 将依次运行技术面、舆情、综合决策三个智能体
          </div>
        )}
    </div>
  );
}
