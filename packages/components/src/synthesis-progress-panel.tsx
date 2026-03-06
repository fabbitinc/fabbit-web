import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@fabbit/ui";

export interface SynthesisProgressPanelFailure {
  fileId: string;
  reason: string;
}

export interface SynthesisProgressPanelItem {
  jobId: string;
  fileId: string;
  status: string;
  totalRows: number;
  processedRows: number;
  nodesCreated: number;
  relationshipsCreated: number;
  errorCount: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface SynthesisProgressPanelStatus {
  acceptedCount: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedJobCount: number;
  failed: SynthesisProgressPanelFailure[];
  items: SynthesisProgressPanelItem[];
}

export interface SynthesisProgressPanelProps {
  batchStatus: SynthesisProgressPanelStatus | null;
  fileNames: Record<string, string>;
}

function normalizeStatus(status: string) {
  return status.toLowerCase();
}

export function SynthesisProgressPanel({ batchStatus, fileNames }: SynthesisProgressPanelProps) {
  if (!batchStatus) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-muted/30 px-4 py-10">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">처리 상태를 불러오는 중입니다.</span>
      </div>
    );
  }

  const doneCount = batchStatus.completedCount + batchStatus.failedJobCount;
  const overallPercent =
    batchStatus.acceptedCount > 0 ? Math.round((doneCount / batchStatus.acceptedCount) * 100) : 0;
  const isDone = batchStatus.pendingCount === 0 && batchStatus.processingCount === 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDone
                ? batchStatus.failedJobCount > 0
                  ? "일부 파일 처리가 실패했습니다."
                  : "모든 파일 처리가 완료되었습니다."
                : "업로드한 파일을 처리하고 있습니다."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              전체 {batchStatus.acceptedCount}개 · 완료 {batchStatus.completedCount}개 · 실패 {batchStatus.failedJobCount}개
            </p>
          </div>

          {!isDone ? <Loader2 className="size-4 animate-spin text-primary" /> : null}
        </div>

        <Progress className="mt-4" value={overallPercent} />
      </div>

      <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
        {batchStatus.items.map((item) => {
          const normalizedStatus = normalizeStatus(item.status);
          const fileName = fileNames[item.fileId] ?? item.fileId;
          const progress = item.totalRows > 0 ? Math.round((item.processedRows / item.totalRows) * 100) : 0;
          const itemClassName =
            normalizedStatus === "failed"
              ? "rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3"
              : "rounded-2xl border border-border/70 px-4 py-3";
          const statusClassName =
            normalizedStatus === "completed"
              ? "shrink-0 text-xs font-medium text-emerald-600"
              : normalizedStatus === "failed"
                ? "shrink-0 text-xs font-medium text-destructive"
                : "shrink-0 text-xs font-medium text-muted-foreground";

          return (
            <div key={item.jobId} className={itemClassName}>
              <div className="flex items-start gap-3">
                {normalizedStatus === "completed" ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                ) : normalizedStatus === "failed" ? (
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                ) : (
                  <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
                    <span className={statusClassName}>
                      {normalizedStatus === "completed"
                        ? "완료"
                        : normalizedStatus === "failed"
                          ? "실패"
                          : `${progress}%`}
                    </span>
                  </div>

                  {normalizedStatus === "processing" ? <Progress className="mt-3" value={progress} /> : null}

                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.processedRows.toLocaleString()}/{item.totalRows.toLocaleString()}행 처리
                    {item.errorCount > 0 ? ` · 오류 ${item.errorCount}건` : ""}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {batchStatus.failed.map((failedItem) => (
          <div key={failedItem.fileId} className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-foreground">
                    {fileNames[failedItem.fileId] ?? failedItem.fileId}
                  </p>
                  <span className="shrink-0 text-xs font-medium text-destructive">시작 실패</span>
                </div>
                <p className="mt-2 text-xs text-destructive">{failedItem.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
