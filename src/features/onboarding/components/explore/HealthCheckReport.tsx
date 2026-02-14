import { CheckCircle2, AlertTriangle, Info, Database, GitFork } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { HealthCheckResponse, HealthCheckIssueDTO } from "@/api/types/onboarding";

/** "부품 10 (i)" 순서로 렌더: 번역명 → 카운트 → 원문 툴팁 아이콘 */
function LabelBadgeContent({ display, original, count }: { display: string; original: string; count: number }) {
  const showTooltip = display !== original;
  return (
    <span className="inline-flex items-center gap-1">
      <span>{display}</span>
      <span className="font-semibold">{count.toLocaleString()}</span>
      {showTooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="inline-flex cursor-help items-center text-gray-400" aria-label="원문 보기">
              <Info className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>{original}</TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}

/** 이슈 메시지에서 뱃지와 중복되는 "N개", "N건" 등 후미 숫자 표현 제거 */
function stripTrailingCount(message: string, count: number): string {
  if (count <= 0) return message;
  return message.replace(new RegExp(`\\s*${count}\\s*[개건]\\s*$`), "");
}

interface HealthCheckReportProps {
  report: HealthCheckResponse;
}

const severityConfig = {
  error: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    label: "개선 권장",
  },
  warning: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-100",
    label: "참고",
  },
  info: {
    icon: Info,
    color: "text-gray-400",
    bg: "bg-gray-50 border-gray-100",
    label: "정보",
  },
} as const;

export function HealthCheckReport({ report }: HealthCheckReportProps) {
  const { t } = useTranslation(["mapping"]);
  const errorCount = report.issues.filter((i) => i.severity === "error").length;
  const hasIssues = errorCount > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {/* 상단: 상태 요약 */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center size-10 rounded-full ${hasIssues ? "bg-amber-100" : "bg-green-100"}`}>
          {hasIssues ? (
            <AlertTriangle className="size-5 text-amber-600" />
          ) : (
            <CheckCircle2 className="size-5 text-green-600" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {hasIssues ? "데이터 구축 완료 (개선 가능)" : "데이터 구축 완료"}
          </h3>
          <p className="text-sm text-gray-500">
            지식 그래프가 성공적으로 생성되었습니다
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
          <Database className="size-5 text-blue-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {report.total_nodes.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">노드</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
          <GitFork className="size-5 text-violet-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {report.total_relationships.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">관계</p>
          </div>
        </div>
      </div>

      {/* 노드 상세 */}
      {Object.keys(report.node_counts).length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-400 mr-1">노드</span>
          {Object.entries(report.node_counts).map(([label, count]) => (
            <Badge key={label} variant="secondary" className="text-xs">
              <LabelBadgeContent
                display={t(`mapping:nodeLabel.${label}`, label)}
                original={label}
                count={count}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* 관계 상세 */}
      {Object.keys(report.relationship_counts).length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-400 mr-1">관계</span>
          {Object.entries(report.relationship_counts).map(([type, count]) => (
            <Badge key={type} variant="outline" className="text-xs">
              <LabelBadgeContent
                display={t(`mapping:relType.${type}`, type)}
                original={type}
                count={count}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* 이슈 → 개선 가이드 */}
      {report.issues.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            개선 가이드
          </p>
          {report.issues.map((issue: HealthCheckIssueDTO, index: number) => {
            const config =
              severityConfig[issue.severity as keyof typeof severityConfig] ||
              severityConfig.info;
            const Icon = config.icon;

            return (
              <div
                key={index}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${config.bg}`}
              >
                <Icon className={`size-4 shrink-0 mt-0.5 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      {stripTrailingCount(issue.message, issue.count)}
                    </span>
                    {issue.count > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {issue.count}건
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {config.label} · {issue.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {report.issues.length === 0 && (
        <div className="text-center py-3">
          <p className="text-sm text-green-600 font-medium">
            개선 사항이 없습니다
          </p>
        </div>
      )}
    </div>
  );
}
