import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StorageCategoryTrend } from "../../types/usage-trend.types";

interface StorageTrendChartProps {
  data: StorageCategoryTrend[];
  bytesLimit: number;
}

type Range = "7" | "30" | "365";

const CATEGORIES = [
  { key: "drawing" as const, label: "도면", color: "var(--brand-500)" },
  { key: "attachment" as const, label: "첨부파일", color: "var(--status-info)" },
  { key: "other" as const, label: "기타", color: "var(--muted-foreground)" },
];

function formatDate(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function formatMonth(date: string): string {
  const [, m] = date.split("-");
  return `${Number(m)}월`;
}

function formatGB(bytes: number): string {
  return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
}

/** 일별 데이터를 월별로 집계 (마지막 값 = 해당 월의 스냅샷) */
function aggregateMonthly(data: StorageCategoryTrend[]): StorageCategoryTrend[] {
  const map = new Map<string, StorageCategoryTrend>();

  for (const item of data) {
    const monthKey = item.date.slice(0, 7);
    map.set(monthKey, { ...item, date: monthKey });
  }

  return Array.from(map.values());
}

export function StorageTrendChart({ data, bytesLimit }: StorageTrendChartProps) {
  const limitGB = bytesLimit / 1_000_000_000;
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
          스토리지 추이
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
                <linearGradient key={cat.key} id={`storageFill-${cat.key}`} x1="0" y1="0" x2="0" y2="1">
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
              tickFormatter={(v: number) => `${(v / 1_000_000_000).toFixed(0)} GB`}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as StorageCategoryTrend;
                const total = item.drawing + item.attachment + item.other;
                const label = isMonthly ? formatMonth(item.date) : formatDate(item.date);
                return (
                  <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                    <p className="mb-1 font-medium text-foreground">
                      {label} · 총 {formatGB(total)}
                    </p>
                    {CATEGORIES.map((cat) => (
                      <div key={cat.key} className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.label}: {formatGB(item[cat.key])}
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
            <ReferenceLine
              y={limitGB * 1_000_000_000}
              stroke="var(--status-warning)"
              strokeDasharray="6 4"
              label={{
                value: `한도 ${limitGB.toFixed(0)} GB`,
                position: "insideTopRight",
                fill: "var(--status-warning)",
                fontSize: 11,
              }}
            />
            {CATEGORIES.map((cat) => (
              <Area
                key={cat.key}
                type="monotone"
                dataKey={cat.key}
                stackId="storage"
                stroke={cat.color}
                strokeWidth={2}
                fill={`url(#storageFill-${cat.key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
