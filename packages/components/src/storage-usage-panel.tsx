import type { CSSProperties } from "react";
import { AlertTriangle, HardDrive } from "lucide-react";
import { Badge, Progress } from "@fabbit/ui";
import { StorageTrendChart, type StorageTrendChartItem } from "./storage-trend-chart";

export interface StorageUsagePanelCategoryItem {
  category: "drawing" | "attachment" | "other";
  bytesUsed: number;
  fileCount: number;
}

export interface StorageUsagePanelData {
  bytesUsed: number;
  bytesLimit: number;
  bytesOverage: number;
  allowOverage: boolean;
  categories: StorageUsagePanelCategoryItem[];
}

export interface StorageUsagePanelProps {
  trend: StorageTrendChartItem[];
  usage: StorageUsagePanelData;
}

const categoryLabels: Record<StorageUsagePanelCategoryItem["category"], string> = {
  drawing: "도면",
  attachment: "첨부파일",
  other: "기타",
};

const categoryColors: Record<StorageUsagePanelCategoryItem["category"], string> = {
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

export function StorageUsagePanel({ trend, usage }: StorageUsagePanelProps) {
  const usagePercent = usage.bytesLimit > 0 ? (usage.bytesUsed / usage.bytesLimit) * 100 : 0;
  const isWarning = usagePercent >= 80;
  const isOver = usage.bytesOverage > 0;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">스토리지 사용량</h2>

        <div className="rounded-[24px] border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <HardDrive className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {formatBytes(usage.bytesUsed)} / {formatBytes(usage.bytesLimit)}
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
            {isOver ? ` · 초과 ${formatBytes(usage.bytesOverage)}` : ""}
          </p>
        </div>
      </section>

      {usage.categories.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">카테고리별 사용량</h2>
          <div className="space-y-3">
            {usage.categories.map((category) => {
              const percent = usage.bytesUsed > 0 ? (category.bytesUsed / usage.bytesUsed) * 100 : 0;
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

      <StorageTrendChart bytesLimit={usage.bytesLimit} data={trend} />
    </div>
  );
}
