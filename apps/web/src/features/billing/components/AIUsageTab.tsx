import { useState } from "react";
import {
  FileSpreadsheet,
  ScanLine,
  MessageSquare,
  ShoppingCart,
  CalendarClock,
  RotateCcw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  mockPlan,
  mockAIFeatureUsages,
  mockAIUsageTrend,
  mockCreditPackages,
} from "../mock-data/billing-mock";
import type { AIFeatureKey, AICreditPackage } from "../types/billing.types";

const featureIcons: Record<AIFeatureKey, typeof FileSpreadsheet> = {
  bom_analysis: FileSpreadsheet,
  drawing_analysis: ScanLine,
  ai_chat: MessageSquare,
};

/** 차트 범례용 단색 (fallback) */
const featureColors: Record<AIFeatureKey, string> = {
  bom_analysis: "var(--ai-from, #06b6d4)",
  drawing_analysis: "var(--ai-to, #2563eb)",
  ai_chat: "var(--ai-text, #1e40af)",
};

function daysUntil(dateStr: string) {
  const target = new Date(dateStr);
  const now = new Date(2026, 2, 3); // 모의 오늘
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

export function AIUsageTab() {
  const [purchaseTarget, setPurchaseTarget] = useState<AICreditPackage | null>(null);

  const resetDate = mockPlan.nextBillingDate;
  const daysLeft = daysUntil(resetDate);

  function handlePurchaseConfirm() {
    if (!purchaseTarget) return;
    toast.success(
      `${purchaseTarget.label} ${purchaseTarget.quantity.toLocaleString()}${purchaseTarget.unit} 크레딧을 구매했습니다.`,
    );
    setPurchaseTarget(null);
  }

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
          <RotateCcw className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            다음 결제일에 사용량이 초기화됩니다
          </p>
          <p className="text-xs text-muted-foreground">
            결제 주기에 따라 매월 사용량이 리셋됩니다. 초과 사용 시 추가 크레딧을 구매하세요.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium" style={{ color: "var(--ai-from, #06b6d4)" }}>
          <CalendarClock className="h-3.5 w-3.5" />
          {resetDate} ({daysLeft}일 남음)
        </div>
      </div>

      {/* ── 기능별 사용량 카드 그리드 ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          AI 기능별 사용량
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {mockAIFeatureUsages.map((feat) => {
            const Icon = featureIcons[feat.key];
            const percent = (feat.used / feat.limit) * 100;
            const isHigh = percent >= 80;
            return (
              <div
                key={feat.key}
                className="rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded"
                    style={{
                      background: "linear-gradient(135deg, var(--ai-from, #06b6d4), var(--ai-to, #2563eb))",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {feat.label}
                  </span>
                  {isHigh && (
                    <Badge variant="destructive" className="ml-auto text-[10px]">
                      한도 임박
                    </Badge>
                  )}
                </div>
                {/* AI 그라디언트 프로그레스 바 */}
                <div
                  className="relative h-2 w-full overflow-hidden rounded-full"
                  style={{
                    background: "color-mix(in srgb, var(--ai-from, #06b6d4) 15%, transparent)",
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(percent, 100)}%`,
                      background: isHigh
                        ? "var(--status-danger)"
                        : "linear-gradient(90deg, var(--ai-from, #06b6d4), var(--ai-to, #2563eb))",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {feat.used.toLocaleString()} / {feat.limit.toLocaleString()}{" "}
                    {feat.unit}
                  </p>
                  <span
                    className="text-xs font-medium tabular-nums"
                    style={{
                      color: isHigh ? "var(--status-danger)" : "var(--ai-from, #06b6d4)",
                    }}
                  >
                    {percent.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 사용량 추이 차트 ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          최근 14일 사용량 추이
        </h2>
        <div className="rounded-lg border border-border p-4">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={mockAIUsageTrend}
              margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
            >
              <defs>
                <linearGradient id="aiGradFill-bom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ai-from, #06b6d4)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--ai-from, #06b6d4)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="aiGradFill-drawing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ai-to, #2563eb)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--ai-to, #2563eb)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="aiGradFill-chat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ai-text, #1e40af)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--ai-text, #1e40af)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="bom_analysis"
                name="BOM 분석"
                stackId="1"
                stroke="var(--ai-from, #06b6d4)"
                fill="url(#aiGradFill-bom)"
              />
              <Area
                type="monotone"
                dataKey="drawing_analysis"
                name="도면 분석"
                stackId="1"
                stroke="var(--ai-to, #2563eb)"
                fill="url(#aiGradFill-drawing)"
              />
              <Area
                type="monotone"
                dataKey="ai_chat"
                name="AI 채팅"
                stackId="1"
                stroke="var(--ai-text, #1e40af)"
                fill="url(#aiGradFill-chat)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {mockAIFeatureUsages.map((f) => (
              <div key={f.key} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: featureColors[f.key] }}
                />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 추가 크레딧 구매 ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          추가 크레딧 구매
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {mockCreditPackages.map((pkg) => {
            const Icon = featureIcons[pkg.featureKey];
            return (
              <div
                key={pkg.featureKey}
                className="flex flex-col justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-5 w-5 items-center justify-center rounded"
                      style={{
                        background: "linear-gradient(135deg, var(--ai-from, #06b6d4), var(--ai-to, #2563eb))",
                      }}
                    >
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {pkg.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pkg.quantity.toLocaleString()} {pkg.unit}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    ₩{pkg.price.toLocaleString("ko-KR")}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer gap-1"
                    onClick={() => setPurchaseTarget(pkg)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    구매
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 구매 확인 AlertDialog ── */}
      <AlertDialog
        open={!!purchaseTarget}
        onOpenChange={(open) => !open && setPurchaseTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>크레딧 구매 확인</AlertDialogTitle>
            <AlertDialogDescription>
              {purchaseTarget && (
                <>
                  <strong>{purchaseTarget.label}</strong>{" "}
                  {purchaseTarget.quantity.toLocaleString()}
                  {purchaseTarget.unit}을(를){" "}
                  <strong>
                    ₩{purchaseTarget.price.toLocaleString("ko-KR")}
                  </strong>
                  에 구매합니다. 등록된 기본 카드로 즉시 결제됩니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">취소</AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              onClick={handlePurchaseConfirm}
            >
              구매하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
