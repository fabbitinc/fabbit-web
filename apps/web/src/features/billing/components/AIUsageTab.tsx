import { useMemo } from "react";
import {
  Sparkles,
  CalendarClock,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCreditUsage } from "@/api/hooks/useUsage";
import { CreditByCategoryChart } from "./charts/CreditByCategoryChart";
import { generateCreditCategoryTrend } from "../mock-data/usage-mock";

const CATEGORY_COLORS: Record<string, string> = {
  bom_analysis: "var(--ai-from, #06b6d4)",
  drawing_analysis: "var(--ai-to, #2563eb)",
  ai_chat: "var(--ai-text, #1e40af)",
  BOM_ANALYSIS: "var(--ai-from, #06b6d4)",
  DRAWING_ANALYSIS: "var(--ai-to, #2563eb)",
  AI_CHAT: "var(--ai-text, #1e40af)",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysUntil(iso: string): number {
  const target = new Date(iso);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

export function AIUsageTab() {
  const { t } = useTranslation();
  const { data, isLoading } = useCreditUsage();

  // BACKLOG: 기능별 크레딧 추이 — GET /api/v1/usage/credits/trend-by-category API 구현 후 mock 제거.
  const creditCategoryTrend = useMemo(() => generateCreditCategoryTrend(365), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const planPercent = data.planCreditsLimit > 0
    ? (data.planCreditsUsed / data.planCreditsLimit) * 100
    : 0;
  const isPlanHigh = planPercent >= 80;

  const periodEnd = formatDate(data.currentPeriodEnd);
  const daysLeft = daysUntil(data.currentPeriodEnd);

  return (
    <div className="space-y-8">
      {/* ── 리셋 안내 배너 ── */}
      <div
        className="flex items-center gap-3 rounded-lg border px-4 py-3"
        style={{
          borderColor: "color-mix(in srgb, var(--ai-from, #06b6d4) 30%, transparent)",
          background: "color-mix(in srgb, var(--ai-from, #06b6d4) 6%, transparent)",
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, var(--ai-from, #06b6d4), var(--ai-to, #2563eb))",
          }}
        >
          <CalendarClock className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            다음 결제일에 플랜 크레딧이 초기화됩니다
          </p>
          <p className="text-xs text-muted-foreground">
            추가 구매 크레딧은 초기화되지 않으며 소진 시까지 유지됩니다.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium" style={{ color: "var(--ai-from, #06b6d4)" }}>
          <CalendarClock className="h-3.5 w-3.5" />
          {periodEnd} ({daysLeft}일 남음)
        </div>
      </div>

      {/* ── 플랜 크레딧 ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          플랜 크레딧
        </h2>
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded"
                style={{
                  background: "linear-gradient(135deg, var(--ai-from, #06b6d4), var(--ai-to, #2563eb))",
                }}
              >
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {data.planCreditsUsed.toLocaleString()} / {data.planCreditsLimit.toLocaleString()} 크레딧
              </span>
            </div>
            {isPlanHigh && (
              <Badge variant="destructive" className="text-[10px]">
                한도 임박
              </Badge>
            )}
          </div>
          <div
            className="relative h-2 w-full overflow-hidden rounded-full"
            style={{
              background: "color-mix(in srgb, var(--ai-from, #06b6d4) 15%, transparent)",
            }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(planPercent, 100)}%`,
                background: isPlanHigh
                  ? "var(--status-danger)"
                  : "linear-gradient(90deg, var(--ai-from, #06b6d4), var(--ai-to, #2563eb))",
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs tabular-nums text-muted-foreground">
              잔여 {data.planCreditsRemaining.toLocaleString()} 크레딧
            </p>
            <span
              className="text-xs font-medium tabular-nums"
              style={{
                color: isPlanHigh ? "var(--status-danger)" : "var(--ai-from, #06b6d4)",
              }}
            >
              {planPercent.toFixed(0)}%
            </span>
          </div>
        </div>
      </section>

      {/* ── 추가 구매 크레딧 ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          추가 구매 크레딧
        </h2>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/10">
                <ShoppingCart className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-foreground">
                잔여 {data.bonusCreditsRemaining.toLocaleString()} 크레딧
              </span>
            </div>
            {data.bonusCreditsUsed > 0 && (
              <span className="text-xs tabular-nums text-muted-foreground">
                사용 {data.bonusCreditsUsed.toLocaleString()}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            플랜 크레딧을 먼저 소진한 후 추가 구매 크레딧이 사용됩니다.
            <br />
            추가 구매 크레딧은 결제 주기와 관계없이 소진 시까지 유지됩니다.
          </p>
        </div>
      </section>

      {/* ── 기능별 사용 횟수 ── */}
      {data.categories.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            기능별 사용 횟수
          </h2>
          <div className="space-y-3">
            {data.categories.map((cat) => {
              const label = t(`creditCategory.${cat.category}`, cat.category);
              const color = CATEGORY_COLORS[cat.category] ?? "var(--muted-foreground)";
              const totalCount = data.categories.reduce((sum, c) => sum + c.creditsUsed, 0);
              const percent = totalCount > 0
                ? (cat.creditsUsed / totalCount) * 100
                : 0;

              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-foreground">
                        {label}
                      </span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">
                      {cat.creditsUsed.toLocaleString()}회 ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress
                    value={percent}
                    className="h-1.5"
                    indicatorClassName="transition-all"
                    style={{ "--tw-progress-color": color } as React.CSSProperties}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 일별 크레딧 사용 추이 (기능별 Stacked) ── */}
      <CreditByCategoryChart data={creditCategoryTrend} />
    </div>
  );
}
