import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fabbit/ui";

export interface StorageTrendChartItem {
  date: string;
  drawing: number;
  attachment: number;
  other: number;
}

export interface StorageTrendChartProps {
  data: StorageTrendChartItem[];
  bytesLimit: number;
}

type Range = "7" | "30" | "365";

const categories = [
  { key: "drawing" as const, label: "도면", color: "var(--brand-500)" },
  { key: "attachment" as const, label: "첨부파일", color: "var(--status-info)" },
  { key: "other" as const, label: "기타", color: "var(--muted-foreground)" },
];

function formatDate(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function formatMonth(date: string) {
  const [, month] = date.split("-");
  return `${Number(month)}월`;
}

function formatGigabytes(bytes: number) {
  return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
}

function aggregateMonthly(data: StorageTrendChartItem[]) {
  const items = new Map<string, StorageTrendChartItem>();

  data.forEach((item) => {
    const monthKey = item.date.slice(0, 7);
    items.set(monthKey, { ...item, date: monthKey });
  });

  return Array.from(items.values());
}

export function StorageTrendChart({ data, bytesLimit }: StorageTrendChartProps) {
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
        <h2 className="text-base font-semibold text-foreground">스토리지 추이</h2>
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
                <linearGradient key={category.key} id={`storageFill-${category.key}`} x1="0" y1="0" x2="0" y2="1">
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
              tickFormatter={(value: number) => `${(value / 1_000_000_000).toFixed(0)} GB`}
              tickLine={false}
              width={56}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const item = payload[0].payload as StorageTrendChartItem;
                const total = item.drawing + item.attachment + item.other;
                const label = isMonthly ? formatMonth(item.date) : formatDate(item.date);

                return (
                  <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-md">
                    <p className="mb-1 font-medium text-foreground">
                      {label} · 총 {formatGigabytes(total)}
                    </p>
                    {categories.map((category) => (
                      <div key={category.key} className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                        {category.label}: {formatGigabytes(item[category.key])}
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
            <ReferenceLine
              label={{
                fill: "var(--status-warning)",
                fontSize: 11,
                position: "insideTopRight",
                value: `한도 ${(bytesLimit / 1_000_000_000).toFixed(0)} GB`,
              }}
              stroke="var(--status-warning)"
              strokeDasharray="6 4"
              y={bytesLimit}
            />
            {categories.map((category) => (
              <Area
                key={category.key}
                dataKey={category.key}
                fill={`url(#storageFill-${category.key})`}
                stackId="storage"
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
