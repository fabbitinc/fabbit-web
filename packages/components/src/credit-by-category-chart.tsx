import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fabbit/ui";

export interface CreditByCategoryChartItem {
  date: string;
  bomAnalysis: number;
  drawingAnalysis: number;
  aiChat: number;
}

export interface CreditByCategoryChartProps {
  data: CreditByCategoryChartItem[];
}

type Range = "7" | "30" | "365";

const categories = [
  { key: "bomAnalysis" as const, label: "BOM 분석", color: "var(--ai-from)" },
  { key: "drawingAnalysis" as const, label: "도면 분석", color: "var(--ai-to)" },
  { key: "aiChat" as const, label: "AI 채팅", color: "var(--status-accent)" },
];

function formatDate(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function formatMonth(date: string) {
  const [, month] = date.split("-");
  return `${Number(month)}월`;
}

function aggregateMonthly(data: CreditByCategoryChartItem[]) {
  const items = new Map<string, CreditByCategoryChartItem>();

  data.forEach((item) => {
    const monthKey = item.date.slice(0, 7);
    const existing = items.get(monthKey);

    if (existing) {
      existing.bomAnalysis += item.bomAnalysis;
      existing.drawingAnalysis += item.drawingAnalysis;
      existing.aiChat += item.aiChat;
      return;
    }

    items.set(monthKey, { ...item, date: monthKey });
  });

  return Array.from(items.values());
}

export function CreditByCategoryChart({ data }: CreditByCategoryChartProps) {
  const [range, setRange] = useState<Range>("7");
  const isMonthly = range === "365";

  const chartData = useMemo(() => {
    if (isMonthly) {
      return aggregateMonthly(data.slice(-365)).slice(-12);
    }

    return data.slice(-Number(range));
  }, [data, isMonthly, range]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">크레딧 사용 추이</h2>
        <Select value={range} onValueChange={(value) => setRange(value as Range)}>
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">최근 7일</SelectItem>
            <SelectItem value="30">최근 30일</SelectItem>
            <SelectItem value="365">최근 1년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-[24px] border border-border/70 bg-card p-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              {categories.map((category) => (
                <linearGradient key={category.key} id={`creditFill-${category.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={category.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={category.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              axisLine={false}
              dataKey="date"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickFormatter={isMonthly ? formatMonth : formatDate}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickLine={false}
              width={36}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const item = payload[0].payload as CreditByCategoryChartItem;
                const total = item.bomAnalysis + item.drawingAnalysis + item.aiChat;
                const label = isMonthly ? formatMonth(item.date) : formatDate(item.date);

                return (
                  <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-md">
                    <p className="mb-1 font-medium text-foreground">
                      {label} · 총 {total.toLocaleString()}건
                    </p>
                    {categories.map((category) => (
                      <div key={category.key} className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                        {category.label}: {item[category.key].toLocaleString()}건
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              content={() => (
                <div className="flex items-center justify-center gap-4 pt-2">
                  {categories.map((category) => (
                    <div key={category.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.label}
                    </div>
                  ))}
                </div>
              )}
              height={28}
              verticalAlign="bottom"
            />
            {categories.map((category) => (
              <Area
                key={category.key}
                dataKey={category.key}
                fill={`url(#creditFill-${category.key})`}
                stackId="credits"
                stroke={category.color}
                strokeWidth={2}
                type="monotone"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
