import { useMemo, type CSSProperties } from "react";
import { CalendarClock, Loader2, ShoppingCart, Sparkles } from "lucide-react";
import { Badge, Progress } from "@fabbit/ui";
import { CreditByCategoryChart } from "@/features/billing/components/charts/credit-by-category-chart";
import { useCreditUsageQuery } from "@/features/billing/hooks/use-credit-usage-query";
import { generateCreditCategoryTrend } from "@/features/billing/mock-data/usage-mock";

const categoryLabels: Record<string, string> = {
  bom_analysis: "BOM 분석",
  drawing_analysis: "도면 분석",
  ai_chat: "AI 채팅",
  BOM_ANALYSIS: "BOM 분석",
  DRAWING_ANALYSIS: "도면 분석",
  AI_CHAT: "AI 채팅",
};

const categoryColors: Record<string, string> = {
  bom_analysis: "var(--ai-from)",
  drawing_analysis: "var(--ai-to)",
  ai_chat: "var(--status-accent)",
  BOM_ANALYSIS: "var(--ai-from)",
  DRAWING_ANALYSIS: "var(--ai-to)",
  AI_CHAT: "var(--status-accent)",
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysUntil(iso: string) {
  const target = new Date(iso);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

export function AIUsageTab() {
  const creditTrend = useMemo(() => generateCreditCategoryTrend(365), []);
  const creditUsageQuery = useCreditUsageQuery();

  if (creditUsageQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!creditUsageQuery.data) {
    return null;
  }

  const data = creditUsageQuery.data;
  const planPercent = data.planCreditsLimit > 0 ? (data.planCreditsUsed / data.planCreditsLimit) * 100 : 0;
  const periodEnd = formatDate(data.currentPeriodEnd);
  const daysLeft = daysUntil(data.currentPeriodEnd);

  return (
    <div className="space-y-8">
      <div
        className="flex items-center gap-3 rounded-[24px] border px-4 py-3"
        style={{
          background: "color-mix(in srgb, var(--ai-from) 6%, transparent)",
          borderColor: "color-mix(in srgb, var(--ai-from) 30%, transparent)",
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg, var(--ai-from), var(--ai-to))" }}
        >
          <CalendarClock className="size-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">다음 결제일에 플랜 크레딧이 초기화됩니다.</p>
          <p className="text-xs text-muted-foreground">추가 구매 크레딧은 초기화되지 않고 남은 수량이 유지됩니다.</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium" style={{ color: "var(--ai-from)" }}>
          <CalendarClock className="size-3.5" />
          {periodEnd} ({daysLeft}일 남음)
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">플랜 크레딧</h2>
        <div className="space-y-3 rounded-[24px] border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded"
                style={{ background: "linear-gradient(135deg, var(--ai-from), var(--ai-to))" }}
              >
                <Sparkles className="size-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {data.planCreditsUsed.toLocaleString()} / {data.planCreditsLimit.toLocaleString()} 크레딧
              </span>
            </div>
            {planPercent >= 80 ? <Badge variant="destructive">한도 임박</Badge> : null}
          </div>
          <Progress
            className="h-2.5"
            indicatorClassName={planPercent >= 80 ? "bg-[var(--status-danger)]" : ""}
            style={{ "--tw-progress-color": "var(--ai-from)" } as CSSProperties}
            value={Math.min(planPercent, 100)}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs tabular-nums text-muted-foreground">잔여 {data.planCreditsRemaining.toLocaleString()} 크레딧</p>
            <span
              className="text-xs font-medium tabular-nums"
              style={{ color: planPercent >= 80 ? "var(--status-danger)" : "var(--ai-from)" }}
            >
              {planPercent.toFixed(0)}%
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">추가 구매 크레딧</h2>
        <div className="rounded-[24px] border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--status-warning-bg)]">
                <ShoppingCart className="size-3.5 text-[var(--status-warning)]" />
              </div>
              <span className="text-sm font-medium text-foreground">
                잔여 {data.bonusCreditsRemaining.toLocaleString()} 크레딧
              </span>
            </div>
            {data.bonusCreditsUsed > 0 ? (
              <span className="text-xs tabular-nums text-muted-foreground">사용 {data.bonusCreditsUsed.toLocaleString()}</span>
            ) : null}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            플랜 크레딧을 먼저 소진한 뒤 추가 구매 크레딧이 사용됩니다.
            <br />
            추가 구매 크레딧은 결제 주기와 관계없이 유지됩니다.
          </p>
        </div>
      </section>

      {data.categories.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">기능별 사용 현황</h2>
          <div className="space-y-3">
            {data.categories.map((category) => {
              const totalUsageCount = data.categories.reduce((sum, item) => sum + item.usageCount, 0);
              const usagePercent = totalUsageCount > 0 ? (category.usageCount / totalUsageCount) * 100 : 0;
              const color = categoryColors[category.category] ?? "var(--muted-foreground)";

              return (
                <div key={category.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-medium text-foreground">
                        {categoryLabels[category.category] ?? category.category}
                      </span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">
                      {category.usageCount.toLocaleString()}건 · {category.creditsUsed.toLocaleString()} 크레딧
                    </span>
                  </div>
                  <Progress
                    className="h-1.5"
                    indicatorClassName="transition-all"
                    style={{ "--tw-progress-color": color } as CSSProperties}
                    value={usagePercent}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <CreditByCategoryChart data={creditTrend} />
    </div>
  );
}
