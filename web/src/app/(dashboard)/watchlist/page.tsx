"use client";

import { useState } from "react";
import { Trash2, Plus, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWatchlist, useAddWatchlist, useRemoveWatchlist } from "@/hooks/use-watchlist";
import { useMarketStore } from "@/stores/market-store";
import { useRouter } from "next/navigation";

export default function WatchlistPage() {
  const router = useRouter();
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");

  const { data: list, isLoading } = useWatchlist();
  const addMutation = useAddWatchlist();
  const removeMutation = useRemoveWatchlist();
  const { setActiveSymbol } = useMarketStore();

  const handleAdd = () => {
    if (!symbol.trim()) return;
    addMutation.mutate({
      symbol: symbol.trim(),
      name: name.trim() || symbol.trim(),
      market: "CN",
    });
    setSymbol("");
    setName("");
  };

  const handleView = (sym: string) => {
    setActiveSymbol(sym);
    router.push("/market");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">自选股管理</h1>

      {/* 添加表单 */}
      <div className="flex gap-2">
        <Input
          placeholder="股票代码"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="w-36"
        />
        <Input
          placeholder="名称（可选）"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-40"
        />
        <Button size="sm" onClick={handleAdd} disabled={addMutation.isPending}>
          <Plus className="h-4 w-4 mr-1" />
          添加
        </Button>
      </div>

      {/* 列表 */}
      {isLoading ? (
        <div className="text-muted-foreground">加载中...</div>
      ) : !list || list.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          暂无自选股，请添加
        </div>
      ) : (
        <div className="rounded-lg border divide-y">
          {list.map((item) => (
            <div key={item.id} className="flex items-center px-4 py-3 gap-4">
              <div className="flex-1">
                <span className="font-medium">{item.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {item.symbol}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{item.market}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleView(item.symbol)}
                title="查看行情"
              >
                <LineChart className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMutation.mutate(item.id)}
                disabled={removeMutation.isPending}
                title="删除"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
