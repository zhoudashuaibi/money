"use client";

import { cn } from "@/lib/utils";
import type { Quote } from "@/types";

interface QuoteCardProps {
  quote: Quote | null | undefined;
  isLoading?: boolean;
}

export function QuoteCard({ quote, isLoading }: QuoteCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border p-4 animate-pulse">
        <div className="h-4 w-20 bg-muted rounded mb-2" />
        <div className="h-8 w-32 bg-muted rounded" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="rounded-lg border p-4 text-muted-foreground text-sm">
        请输入股票代码查询
      </div>
    );
  }

  const isUp = quote.changePct >= 0;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold">{quote.name}</span>
        <span className="text-sm text-muted-foreground">{quote.symbol}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <span className={cn("text-3xl font-bold", isUp ? "text-red-500" : "text-green-500")}>
          {quote.price.toFixed(2)}
        </span>
        <span className={cn("text-sm font-medium", isUp ? "text-red-500" : "text-green-500")}>
          {isUp ? "+" : ""}{quote.changePct.toFixed(2)}%
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div>开: {quote.openPrice.toFixed(2)}</div>
        <div>高: {quote.highPrice.toFixed(2)}</div>
        <div>低: {quote.lowPrice.toFixed(2)}</div>
      </div>
    </div>
  );
}
