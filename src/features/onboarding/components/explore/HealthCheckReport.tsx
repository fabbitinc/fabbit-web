import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { HealthCheckReport as HealthCheckReportType } from "@/features/onboarding/types/onboarding.types";

interface HealthCheckReportProps {
  report: HealthCheckReportType;
}

const severityConfig = {
  error: {
    icon: AlertCircle,
    color: "text-[#ef4444]",
    bg: "bg-red-50",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-[#f59e0b]",
    bg: "bg-amber-50",
  },
  info: {
    icon: Info,
    color: "text-[#3b82f6]",
    bg: "bg-blue-50",
  },
} as const;

function getScoreColor(score: number) {
  if (score >= 80) return "text-[#22c55e]";
  if (score >= 60) return "text-[#f59e0b]";
  return "text-[#ef4444]";
}

export function HealthCheckReport({ report }: HealthCheckReportProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 space-y-5">
      {/* 상단: 제목 + 점수 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#0f172a]">
          데이터 헬스 체크
        </h3>
        <div className="text-right">
          <span className={`text-4xl font-bold ${getScoreColor(report.score)}`}>
            {report.score}
          </span>
          <span className="text-sm text-[#94a3b8]">/100</span>
        </div>
      </div>

      {/* 통계 */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary">노드 {report.totalNodes.toLocaleString()}개</Badge>
        <Badge variant="secondary">관계 {report.totalRelations.toLocaleString()}개</Badge>
      </div>

      {/* Progress 바 */}
      <Progress value={report.score} className="h-2" />

      {/* 항목 목록 */}
      <div className="space-y-2">
        {report.items.map((item, index) => {
          const config = severityConfig[item.severity];
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${config.bg}`}
            >
              <Icon className={`size-5 shrink-0 ${config.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#0f172a]">
                    {item.label}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {item.count}건
                  </Badge>
                </div>
                <p className="text-xs text-[#64748b] mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
