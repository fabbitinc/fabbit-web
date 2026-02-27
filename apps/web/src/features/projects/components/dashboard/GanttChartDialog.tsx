import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GanttItem } from "../../types/dashboard.types";

interface GanttChartDialogProps {
  open: boolean;
  onClose: () => void;
  items: GanttItem[];
}

export function GanttChartDialog({ open, onClose, items }: GanttChartDialogProps) {
  if (!open) return null;

  // 간트 차트 데이터 변환
  const chartData = items.map((item) => {
    const start = new Date(item.startDate).getTime();
    const end = new Date(item.endDate).getTime();
    const minDate = Math.min(...items.map((i) => new Date(i.startDate).getTime()));

    return {
      name: item.name,
      start: (start - minDate) / (1000 * 60 * 60 * 24), // 시작일 (일 단위)
      duration: (end - start) / (1000 * 60 * 60 * 24), // 기간 (일 단위)
      progress: item.progress,
      color: item.color,
      startDate: item.startDate,
      endDate: item.endDate,
    };
  });

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: { name: string; startDate: string; endDate: string; progress: number } }[];
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-[#0f172a]">{item.name}</p>
          <p className="text-xs text-[#64748b]">
            {item.startDate} ~ {item.endDate}
          </p>
          <p className="text-xs text-[#64748b]">진행률: {item.progress}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#8b5cf6]" />
            <h2 className="text-lg font-semibold text-[#0f172a]">전체 프로젝트 일정</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" barSize={24}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
              {/* 시작 offset (투명) */}
              <Bar dataKey="start" stackId="a" fill="transparent" />
              {/* 실제 기간 */}
              <Bar dataKey="duration" stackId="a" radius={[4, 4, 4, 4]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 범례 */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-[#64748b]">
                {item.name} ({item.progress}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
