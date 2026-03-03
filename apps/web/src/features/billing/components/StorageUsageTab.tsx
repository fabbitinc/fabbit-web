import { useState } from "react";
import { HardDrive, AlertTriangle, Ban, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  mockStorageUsage,
  mockOverageSettings,
} from "../mock-data/billing-mock";
import type { OveragePolicy } from "../types/billing.types";

function formatGB(gb: number) {
  return gb % 1 === 0 ? `${gb} GB` : `${gb.toFixed(1)} GB`;
}

const policyOptions: Array<{
  key: OveragePolicy;
  label: string;
  description: string;
  icon: typeof Ban;
}> = [
  {
    key: "block",
    label: "업로드 제한",
    description: "기본 용량 초과 시 파일 업로드를 차단합니다.",
    icon: Ban,
  },
  {
    key: "pay_per_use",
    label: "종량제 과금",
    description: "초과 사용량만큼 자동으로 과금됩니다.",
    icon: Zap,
  },
];

export function StorageUsageTab() {
  const [policy, setPolicy] = useState<OveragePolicy>(mockOverageSettings.policy);
  const [monthlyCap, setMonthlyCap] = useState(mockOverageSettings.monthlyCapAmount);

  const usagePercent =
    (mockStorageUsage.usedGB / mockStorageUsage.limitGB) * 100;
  const isWarning = usagePercent >= 80;

  function handleSave() {
    toast.success("초과 정책 설정이 저장되었습니다.");
  }

  return (
    <div className="space-y-8">
      {/* ── 전체 사용량 요약 ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          스토리지 사용량
        </h2>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {formatGB(mockStorageUsage.usedGB)} /{" "}
                {formatGB(mockStorageUsage.limitGB)}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                플랜 기본 용량
              </Badge>
            </div>
            {isWarning && (
              <div className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--status-warning)" }}>
                <AlertTriangle className="h-3.5 w-3.5" />
                용량 부족 경고
              </div>
            )}
          </div>
          <Progress
            value={usagePercent}
            className="mt-3 h-2.5"
            indicatorClassName={
              isWarning ? "bg-[var(--status-warning)]" : "bg-[var(--brand-500)]"
            }
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {usagePercent.toFixed(0)}% 사용 중
            {isWarning && " · 기본 용량 초과 시 설정된 정책에 따라 처리됩니다"}
          </p>
        </div>
      </section>

      {/* ── 카테고리별 사용량 ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          카테고리별 사용량
        </h2>
        <div className="space-y-3">
          {mockStorageUsage.categories.map((cat) => {
            const percent =
              (cat.usedGB / mockStorageUsage.usedGB) * 100;
            return (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-foreground">
                      {cat.label}
                    </span>
                  </div>
                  <span className="tabular-nums text-muted-foreground">
                    {formatGB(cat.usedGB)} ({percent.toFixed(0)}%)
                  </span>
                </div>
                <Progress
                  value={percent}
                  className="h-1.5"
                  indicatorClassName="transition-all"
                  style={
                    {
                      "--tw-progress-color": cat.color,
                    } as React.CSSProperties
                  }
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 초과 정책 설정 ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            용량 초과 시 정책
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            추가 GB당{" "}
            <span className="font-semibold tabular-nums text-foreground">
              ₩{mockOverageSettings.pricePerGB.toLocaleString("ko-KR")}/월
            </span>
          </p>
        </div>
        <div className="rounded-lg border border-border p-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {policyOptions.map((opt) => {
              const selected = policy === opt.key;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  type="button"
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-left transition-colors",
                    selected
                      ? "border-[var(--brand-500)] bg-[var(--brand-500)]/5"
                      : "border-border hover:border-muted-foreground/30",
                  )}
                  onClick={() => setPolicy(opt.key)}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      selected
                        ? "border-[var(--brand-500)] bg-[var(--brand-500)]"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {selected && (
                      <span className="block h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {opt.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 종량제일 때만 월 한도 설정 */}
          {policy === "pay_per_use" && (
            <div className="space-y-1.5 max-w-xs">
              <Label htmlFor="monthlyCap">월 과금 한도 (₩)</Label>
              <Input
                id="monthlyCap"
                type="number"
                min={0}
                step={10_000}
                value={monthlyCap}
                onChange={(e) => setMonthlyCap(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                한도에 도달하면 추가 업로드가 차단됩니다. 0이면 무제한입니다.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={handleSave}
            >
              저장
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
