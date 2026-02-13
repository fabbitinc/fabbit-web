import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { HealthCheckResponse, HealthCheckIssueDTO } from "@/api/types/onboarding";

interface HealthCheckReportProps {
  report: HealthCheckResponse;
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

function computeScore(issues: HealthCheckIssueDTO[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === "error") score -= 10;
    else if (issue.severity === "warning") score -= 5;
    else score -= 2;
  }
  return Math.max(0, score);
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-[#22c55e]";
  if (score >= 60) return "text-[#f59e0b]";
  return "text-[#ef4444]";
}

export function HealthCheckReport({ report }: HealthCheckReportProps) {
  const score = computeScore(report.issues);

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 space-y-5">
      {/* 상단: 제목 + 점수 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#0f172a]">
          데이터 헬스 체크
        </h3>
        <div className="text-right">
          <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-sm text-[#94a3b8]">/100</span>
        </div>
      </div>

      {/* 통계 */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary">
          노드 {report.total_nodes.toLocaleString()}개
        </Badge>
        <Badge variant="secondary">
          관계 {report.total_relationships.toLocaleString()}개
        </Badge>
        {Object.entries(report.node_counts).map(([label, count]) => (
          <Badge key={label} variant="outline" className="text-xs">
            {label} {count.toLocaleString()}
          </Badge>
        ))}
      </div>

      {/* Progress 바 */}
      <Progress value={score} className="h-2" />

      {/* 이슈 목록 */}
      {report.issues.length > 0 ? (
        <div className="space-y-2">
          {report.issues.map((issue, index) => {
            const config =
              severityConfig[issue.severity as keyof typeof severityConfig] ||
              severityConfig.info;
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
                      {issue.message}
                    </span>
                    {issue.count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {issue.count}건
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    {issue.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-[#22c55e] font-medium">
            이슈가 발견되지 않았습니다
          </p>
        </div>
      )}
    </div>
  );
}
