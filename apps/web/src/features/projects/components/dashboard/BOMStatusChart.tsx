import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { BOMStatus } from "../../types/dashboard.types";

interface BOMStatusChartProps {
  status: BOMStatus;
}

const COLORS = {
  approved: "#22c55e",
  reviewing: "#f59e0b",
  conflicts: "#ef4444",
};

const LABELS = {
  approved: "승인됨",
  reviewing: "검토중",
  conflicts: "불일치",
};

export function BOMStatusChart({ status }: BOMStatusChartProps) {
  const total = status.approved + status.reviewing + status.conflicts;

  const data = [
    { name: "approved", value: status.approved, label: LABELS.approved },
    { name: "reviewing", value: status.reviewing, label: LABELS.reviewing },
    { name: "conflicts", value: status.conflicts, label: LABELS.conflicts },
  ].filter((item) => item.value > 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { label: string; value: number } }[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-[#0f172a]">{item.label}</p>
          <p className="text-xs text-[#64748b]">
            {item.value}개 ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
      <h3 className="font-semibold text-[#0f172a]">BOM 상태</h3>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-[120px] w-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-[#0f172a]">{total}</p>
              <p className="text-[10px] text-[#94a3b8]">전체</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
              <span className="text-sm text-[#64748b]">승인됨</span>
            </div>
            <span className="text-sm font-medium text-[#0f172a]">{status.approved}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
              <span className="text-sm text-[#64748b]">검토중</span>
            </div>
            <span className="text-sm font-medium text-[#0f172a]">{status.reviewing}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
              <span className="text-sm text-[#64748b]">불일치</span>
            </div>
            <span className="text-sm font-medium text-[#0f172a]">{status.conflicts}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
