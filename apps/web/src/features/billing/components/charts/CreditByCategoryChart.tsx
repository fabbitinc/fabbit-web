import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreditCategoryTrend } from "../../types/usage-trend.types";

interface CreditByCategoryChartProps {
  data: CreditCategoryTrend[];
}

type Range = "7" | "30" | "365";

const CATEGORIES = [
  { key: "bomAnalysis" as const, label: "BOM 분석", color: "var(--ai-from, #06b6d4)" },
  { key: "drawingAnalysis" as const, label: "도면 분석", color: "var(--ai-to, #2563eb)" },
  { key: "aiChat" as const, label: "AI 채팅", color: "var(--ai-text, #1e40af)" },
];

function formatDate(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function formatMonth(date: string): string {
  const [, m] = date.split("-");
  return `${Number(m)}월`;
}

/** 일별 데이터를 월별로 집계 */
function aggregateMonthly(data: CreditCategoryTrend[]): CreditCategoryTrend[] {
  const map = new Map<string, CreditCategoryTrend>();

  for (const item of data) {
    const monthKey = item.date.slice(0, 7);
    const existing = map.get(monthKey);
    if (existing) {
      existing.bomAnalysis += item.bomAnalysis;
      existing.drawingAnalysis += item.drawingAnalysis;
      existing.aiChat += item.aiChat;
    } else {
      map.set(monthKey, { ...item, date: monthKey });
    }
  }

  return Array.from(map.values());
}

export function CreditByCategoryChart({ data }: CreditByCategoryChartProps) {
  const [range, setRange] = useState<Range>("7");

  const isMonthly = range === "365";

  const chartData = useMemo(() => {
    if (isMonthly) {
      return aggregateMonthly(data.slice(-365)).slice(-12);
    }
    return data.slice(-Number(range));
  }, [data, range, isMonthly]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          크레딧 사용 추이
        </h2>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">최근 7일</SelectItem>
            <SelectItem value="30">최근 30일</SelectItem>
            <SelectItem value="365">최근 1년</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border border-border p-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              {CATEGORIES.map((cat) => (
                <linearGradient key={cat.key} id={`creditFill-${cat.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cat.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={cat.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickFormatter={isMonthly ? formatMonth : formatDate}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as CreditCategoryTrend;
                const total = item.bomAnalysis + item.drawingAnalysis + item.aiChat;
                const label = isMonthly ? formatMonth(item.date) : formatDate(item.date);
                return (
                  <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                    <p className="mb-1 font-medium text-foreground">
                      {label} · 총 {total.toLocaleString()} 크레딧
                    </p>
                    {CATEGORIES.map((cat) => (
                      <div key={cat.key} className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.label}: {item[cat.key].toLocaleString()}
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={28}
              content={() => (
                <div className="flex items-center justify-center gap-4 pt-2">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </div>
                  ))}
                </div>
              )}
            />
            {CATEGORIES.map((cat) => (
              <Area
                key={cat.key}
                type="monotone"
                dataKey={cat.key}
                stackId="credits"
                stroke={cat.color}
                strokeWidth={2}
                fill={`url(#creditFill-${cat.key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
