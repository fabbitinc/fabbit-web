import { useMemo, type CSSProperties } from "react";
import { AlertTriangle, HardDrive, Loader2 } from "lucide-react";
import { Badge, Progress } from "@fabbit/ui";
import { useStorageUsageQuery } from "@/features/billing/hooks/use-storage-usage-query";
import { generateStorageCategoryTrend } from "@/features/billing/mock-data/usage-mock";
import { StorageTrendChart } from "@/features/billing/components/charts/storage-trend-chart";
import type { StorageCategoryItemModel } from "@/features/billing/types/billing-model";

const categoryLabels: Record<StorageCategoryItemModel["category"], string> = {
  drawing: "도면",
  attachment: "첨부파일",
  other: "기타",
};

const categoryColors: Record<StorageCategoryItemModel["category"], string> = {
  drawing: "var(--brand-500)",
  attachment: "var(--status-info)",
  other: "var(--muted-foreground)",
};

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1000));
  const value = bytes / 1000 ** unitIndex;

  return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[unitIndex]}`;
}

export function StorageUsageTab() {
  const storageTrend = useMemo(() => generateStorageCategoryTrend(365), []);
  const storageUsageQuery = useStorageUsageQuery();

  if (storageUsageQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!storageUsageQuery.data) {
    return null;
  }

  const data = storageUsageQuery.data;
  const usagePercent = data.bytesLimit > 0 ? (data.bytesUsed / data.bytesLimit) * 100 : 0;
  const isWarning = usagePercent >= 80;
  const isOver = data.bytesOverage > 0;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">스토리지 사용량</h2>

        <div className="rounded-[24px] border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <HardDrive className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {formatBytes(data.bytesUsed)} / {formatBytes(data.bytesLimit)}
              </span>
              <Badge className="text-[10px]" variant="secondary">
                플랜 기본 용량
              </Badge>
            </div>
            {isWarning || isOver ? (
              <div
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: isOver ? "var(--status-danger)" : "var(--status-warning)" }}
              >
                <AlertTriangle className="size-3.5" />
                {isOver ? "용량 초과" : "용량 부족 경고"}
              </div>
            ) : null}
          </div>
          <Progress
            className="mt-3 h-2.5"
            indicatorClassName={
              isOver ? "bg-[var(--status-danger)]" : isWarning ? "bg-[var(--status-warning)]" : "bg-[var(--brand-500)]"
            }
            value={Math.min(usagePercent, 100)}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {usagePercent.toFixed(0)}% 사용 중
            {isOver ? ` · 초과 ${formatBytes(data.bytesOverage)}` : ""}
          </p>
        </div>
      </section>

      {data.categories.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">카테고리별 사용량</h2>
          <div className="space-y-3">
            {data.categories.map((category) => {
              const percent = data.bytesUsed > 0 ? (category.bytesUsed / data.bytesUsed) * 100 : 0;
              const color = categoryColors[category.category];

              return (
                <div key={category.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-medium text-foreground">{categoryLabels[category.category]}</span>
                      <span className="text-xs text-muted-foreground">{category.fileCount.toLocaleString()}개 파일</span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">
                      {formatBytes(category.bytesUsed)} ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress
                    className="h-1.5"
                    indicatorClassName="transition-all"
                    style={{ "--tw-progress-color": color } as CSSProperties}
                    value={percent}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <StorageTrendChart bytesLimit={data.bytesLimit} data={storageTrend} />
    </div>
  );
}
