import { useMemo } from "react";
import { HardDrive, AlertTriangle, Loader2, FolderOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStorageUsage } from "@/api/hooks/useUsage";
import type { StorageCategory } from "../types/billing.types";
import { StorageTrendChart } from "./charts/StorageTrendChart";
import {
  generateStorageCategoryTrend,
} from "../mock-data/usage-mock";

const CATEGORY_COLORS: Record<StorageCategory, string> = {
  drawing: "var(--brand-500)",
  attachment: "var(--status-info)",
  other: "var(--muted-foreground)",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1000));
  const value = bytes / Math.pow(1000, i);
  return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[i]}`;
}

export function StorageUsageTab() {
  const { t } = useTranslation();
  const { data, isLoading } = useStorageUsage();

  // BACKLOG: 카테고리별 스토리지 추이 — GET /api/v1/usage/storage/trend-by-category API 구현 후 mock 제거.
  const storageTrend = useMemo(() => generateStorageCategoryTrend(365), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const usagePercent = data.bytesLimit > 0
    ? (data.bytesUsed / data.bytesLimit) * 100
    : 0;
  const isWarning = usagePercent >= 80;
  const isOver = data.bytesOverage > 0;

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
                {formatBytes(data.bytesUsed)} / {formatBytes(data.bytesLimit)}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                플랜 기본 용량
              </Badge>
            </div>
            {(isWarning || isOver) && (
              <div
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: isOver ? "var(--status-danger)" : "var(--status-warning)" }}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {isOver ? "용량 초과" : "용량 부족 경고"}
              </div>
            )}
          </div>
          <Progress
            value={Math.min(usagePercent, 100)}
            className="mt-3 h-2.5"
            indicatorClassName={
              isOver
                ? "bg-[var(--status-danger)]"
                : isWarning
                  ? "bg-[var(--status-warning)]"
                  : "bg-[var(--brand-500)]"
            }
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {usagePercent.toFixed(0)}% 사용 중
            {isOver && ` · 초과 ${formatBytes(data.bytesOverage)}`}
          </p>
        </div>
      </section>

      {/* ── 카테고리별 사용량 ── */}
      {data.categories.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            카테고리별 사용량
          </h2>
          <div className="space-y-3">
            {data.categories.map((cat) => {
              const label = t(`storageCategory.${cat.category}`, cat.category);
              const color = CATEGORY_COLORS[cat.category] ?? "var(--muted-foreground)";
              const percent = data.bytesUsed > 0
                ? (cat.bytesUsed / data.bytesUsed) * 100
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
                      <span className="text-xs text-muted-foreground">
                        {cat.fileCount.toLocaleString()}개 파일
                      </span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">
                      {formatBytes(cat.bytesUsed)} ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress
                    value={percent}
                    className="h-1.5"
                    indicatorClassName="transition-all"
                    style={
                      {
                        "--tw-progress-color": color,
                      } as React.CSSProperties
                    }
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 스토리지 추이 ── */}
      <StorageTrendChart data={storageTrend} bytesLimit={data.bytesLimit} />

      {/* BACKLOG: 용량 초과 시 정책 설정 — 결제 관리 메뉴로 이동 예정. 백엔드 초과 정책 API 설계 후 구현. */}
    </div>
  );
}
