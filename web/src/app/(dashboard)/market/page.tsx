"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQuote, useKline } from "@/hooks/use-market";
import { useMarketStore } from "@/stores/market-store";
import { QuoteCard } from "@/components/market/quote-card";
import { KlineChart } from "@/components/charts/kline-chart";

export default function MarketPage() {
  const [input, setInput] = useState("");
  const { activeSymbol, setActiveSymbol } = useMarketStore();

  const { data: quote, isLoading: quoteLoading } = useQuote(activeSymbol);
  const { data: kline, isLoading: klineLoading } = useKline(activeSymbol);

  const handleSearch = () => {
    const symbol = input.trim();
    if (symbol) setActiveSymbol(symbol);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">行情中心</h1>
        <div className="flex gap-2 ml-auto">
          <Input
            placeholder="输入股票代码，如 000001"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-56"
          />
          <Button size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4 mr-1" />
            查询
          </Button>
        </div>
      </div>

      {/* 报价卡片 */}
      <QuoteCard quote={quote} isLoading={quoteLoading} />

      {/* K线图 */}
      <div className="rounded-lg border p-4">
        {klineLoading ? (
          <div className="h-[480px] flex items-center justify-center text-muted-foreground">
            加载 K 线数据中...
          </div>
        ) : kline && kline.length > 0 ? (
          <KlineChart data={kline} />
        ) : (
          <div className="h-[480px] flex items-center justify-center text-muted-foreground">
            {activeSymbol ? "暂无K线数据" : "请输入股票代码查看K线图"}
          </div>
        )}
      </div>
    </div>
  );
}
