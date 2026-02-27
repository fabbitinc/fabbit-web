import { DollarSign, Clock, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ResourceTracking } from "../../types/dashboard.types";

interface ResourceTrackingCardProps {
  data: ResourceTracking;
}

type EfficiencyStatus = "stable" | "warning" | "danger";

function getEfficiencyStatus(efficiency: number): EfficiencyStatus {
  if (efficiency <= 0) return "stable"; // 진행률 대비 덜 사용
  if (efficiency <= 10) return "warning"; // 진행률 대비 10% 이내 초과
  return "danger"; // 진행률 대비 10% 이상 초과
}

const statusConfig: Record<EfficiencyStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof CheckCircle2 }> = {
  stable: {
    label: "안정적",
    color: "text-[#22c55e]",
    bgColor: "bg-[#ecfdf5]",
    borderColor: "border-[#bbf7d0]",
    icon: CheckCircle2,
  },
  warning: {
    label: "주의",
    color: "text-[#f59e0b]",
    bgColor: "bg-[#fffbeb]",
    borderColor: "border-[#fde68a]",
    icon: AlertTriangle,
  },
  danger: {
    label: "위험",
    color: "text-[#ef4444]",
    bgColor: "bg-[#fef2f2]",
    borderColor: "border-[#fecaca]",
    icon: XCircle,
  },
};

function formatCurrency(value: number, currency: string): string {
  if (currency === "KRW") {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억원`;
    }
    if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}만원`;
    }
    return `${value.toLocaleString()}원`;
  }
  return `${currency} ${value.toLocaleString()}`;
}

export function ResourceTrackingCard({ data }: ResourceTrackingCardProps) {
  const budgetPercent = Math.round((data.budget.actual / data.budget.planned) * 100);
  const mhPercent = Math.round((data.manHours.actual / data.manHours.planned) * 100);

  // 진행률 대비 리소스 사용률 비교
  const budgetEfficiency = budgetPercent - data.progressRate;
  const mhEfficiency = mhPercent - data.progressRate;

  // 상태 계산
  const budgetStatus = getEfficiencyStatus(budgetEfficiency);
  const mhStatus = getEfficiencyStatus(mhEfficiency);
  const budgetConfig = statusConfig[budgetStatus];
  const mhConfig = statusConfig[mhStatus];
  const BudgetStatusIcon = budgetConfig.icon;
  const MhStatusIcon = mhConfig.icon;

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
      <h3 className="font-semibold text-[#0f172a]">리소스 트래킹</h3>

      <div className="mt-4 space-y-4">
        {/* 예산 */}
        <div
          className={cn(
            "rounded-lg border p-3 transition-colors",
            budgetStatus !== "stable" ? `${budgetConfig.bgColor} ${budgetConfig.borderColor}` : "border-transparent"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className={cn("h-4 w-4", budgetStatus === "stable" ? "text-[#22c55e]" : budgetConfig.color)} />
              <span className="text-sm text-[#64748b]">예산</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#0f172a]">
                {formatCurrency(data.budget.actual, data.budget.currency)}
              </span>
              <span className="text-xs text-[#94a3b8]">
                / {formatCurrency(data.budget.planned, data.budget.currency)}
              </span>
            </div>
          </div>
          <Progress
            value={budgetPercent}
            className={cn(
              "mt-2 h-2",
              budgetStatus === "stable" && "[&>div]:bg-[#22c55e]",
              budgetStatus === "warning" && "[&>div]:bg-[#f59e0b]",
              budgetStatus === "danger" && "[&>div]:bg-[#ef4444]"
            )}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-[#94a3b8]">{budgetPercent}% 사용</span>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5",
                    budgetConfig.bgColor
                  )}
                >
                  <BudgetStatusIcon className={cn("h-3 w-3", budgetConfig.color)} />
                  <span className={cn("text-[10px] font-medium", budgetConfig.color)}>
                    {budgetConfig.label}
                  </span>
                  {budgetEfficiency !== 0 && (
                    <>
                      {budgetEfficiency > 0 ? (
                        <TrendingUp className={cn("h-3 w-3", budgetConfig.color)} />
                      ) : (
                        <TrendingDown className={cn("h-3 w-3", budgetConfig.color)} />
                      )}
                    </>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  진행률 {data.progressRate}% 대비 예산 {budgetPercent}% 사용
                </p>
                <p className="text-xs text-[#94a3b8]">
                  {budgetEfficiency > 0
                    ? `${budgetEfficiency}%p 초과 사용 중`
                    : budgetEfficiency < 0
                      ? `${Math.abs(budgetEfficiency)}%p 절약 중`
                      : "적정 수준"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Man-Hours */}
        <div
          className={cn(
            "rounded-lg border p-3 transition-colors",
            mhStatus !== "stable" ? `${mhConfig.bgColor} ${mhConfig.borderColor}` : "border-transparent"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={cn("h-4 w-4", mhStatus === "stable" ? "text-[#3b82f6]" : mhConfig.color)} />
              <span className="text-sm text-[#64748b]">M-H (공수)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#0f172a]">{data.manHours.actual}h</span>
              <span className="text-xs text-[#94a3b8]">/ {data.manHours.planned}h</span>
            </div>
          </div>
          <Progress
            value={mhPercent}
            className={cn(
              "mt-2 h-2",
              mhStatus === "stable" && "[&>div]:bg-[#3b82f6]",
              mhStatus === "warning" && "[&>div]:bg-[#f59e0b]",
              mhStatus === "danger" && "[&>div]:bg-[#ef4444]"
            )}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-[#94a3b8]">{mhPercent}% 투입</span>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5",
                    mhConfig.bgColor
                  )}
                >
                  <MhStatusIcon className={cn("h-3 w-3", mhConfig.color)} />
                  <span className={cn("text-[10px] font-medium", mhConfig.color)}>
                    {mhConfig.label}
                  </span>
                  {mhEfficiency !== 0 && (
                    <>
                      {mhEfficiency > 0 ? (
                        <TrendingUp className={cn("h-3 w-3", mhConfig.color)} />
                      ) : (
                        <TrendingDown className={cn("h-3 w-3", mhConfig.color)} />
                      )}
                    </>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  진행률 {data.progressRate}% 대비 공수 {mhPercent}% 투입
                </p>
                <p className="text-xs text-[#94a3b8]">
                  {mhEfficiency > 0
                    ? `${mhEfficiency}%p 초과 투입 중`
                    : mhEfficiency < 0
                      ? `${Math.abs(mhEfficiency)}%p 절약 중`
                      : "적정 수준"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 전체 진행률 */}
        <div className="rounded-lg bg-[#f8fafc] p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#64748b]">전체 진행률</span>
            <span className="text-lg font-bold text-[#8b5cf6]">{data.progressRate}%</span>
          </div>
          <Progress
            value={data.progressRate}
            className="mt-2 h-2.5 [&>div]:bg-gradient-to-r [&>div]:from-[#8b5cf6] [&>div]:to-[#6366f1]"
          />
        </div>
      </div>
    </div>
  );
}
