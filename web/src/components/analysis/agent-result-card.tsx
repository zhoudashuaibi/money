"use client";

import type { AgentResult } from "@/hooks/use-analysis";
import { BarChart3, Newspaper, Brain } from "lucide-react";

const agentMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  technical: { label: "技术面分析", icon: <BarChart3 className="h-4 w-4" /> },
  sentiment: { label: "舆情分析", icon: <Newspaper className="h-4 w-4" /> },
  decision: { label: "综合决策", icon: <Brain className="h-4 w-4" /> },
};

export function AgentResultCard({ result }: { result: AgentResult }) {
  const meta = agentMeta[result.agent] || {
    label: result.agent,
    icon: <Brain className="h-4 w-4" />,
  };
  const tokens = result.usage.promptTokens + result.usage.completionTokens;

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center gap-2">
        {meta.icon}
        <span className="font-medium">{meta.label}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {tokens} tokens
        </span>
      </div>
      <div className="text-sm whitespace-pre-wrap leading-relaxed">
        {result.content}
      </div>
    </div>
  );
}
