export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 占位卡片 - 后续 P1 阶段填充真实数据 */}
        <StatCard label="上证指数" value="--" change="--" />
        <StatCard label="深证成指" value="--" change="--" />
        <StatCard label="自选股数" value="0" />
        <StatCard label="今日分析" value="0" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-4 h-64 flex items-center justify-center text-muted-foreground">
          K线图区域（待接入 ECharts）
        </div>
        <div className="rounded-lg border p-4 h-64 flex items-center justify-center text-muted-foreground">
          新闻资讯区域（待接入 Tavily）
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change?: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {change && (
        <p className="mt-1 text-sm text-muted-foreground">{change}</p>
      )}
    </div>
  );
}
