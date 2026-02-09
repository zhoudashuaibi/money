"use client";

import { useState } from "react";
import { useAnalysisList } from "@/hooks/use-analysis";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading } = useAnalysisList(page, pageSize);

  const list = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">分析历史</h1>

      {isLoading ? (
        <div className="text-muted-foreground">加载中...</div>
      ) : list.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          暂无分析记录，请先前往 AI 分析页面进行分析
        </div>
      ) : (
        <>
          <div className="rounded-lg border divide-y">
            {list.map((record) => (
              <div key={record.id} className="px-4 py-3 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{record.symbol}</span>
                  <span className="text-xs text-muted-foreground">
                    {dayjs(record.createdAt).format("YYYY-MM-DD HH:mm")}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {record.totalTokens} tokens
                  </span>
                </div>
                {record.recommendation && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {record.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
