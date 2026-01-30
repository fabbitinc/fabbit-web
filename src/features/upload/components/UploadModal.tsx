import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useUploadStore, type UploadFile } from "@/stores/uploadStore";
import { cn } from "@/lib/utils";

export function UploadModal() {
  const { isModalOpen, closeModal, files, addFiles, removeFile } = useUploadStore();

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.type === "application/pdf" ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.name.endsWith(".dwg")
      );
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files ?? []);
      if (selectedFiles.length > 0) {
        addFiles(selectedFiles);
      }
      e.target.value = "";
    },
    [addFiles]
  );

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-[#3b82f6]" />
            도면/BOM 업로드
          </DialogTitle>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          className="relative rounded-xl border-2 border-dashed border-[#e2e8f0] bg-[#f8fafc] p-8 text-center transition-colors hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.dwg"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3b82f6]/10">
              <Upload className="h-7 w-7 text-[#3b82f6]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0f172a]">
                파일을 드래그하거나 클릭하여 선택
              </p>
              <p className="mt-1 text-xs text-[#64748b]">
                PDF, Excel, DWG 파일 지원 · 최대 50MB
              </p>
            </div>
          </div>
        </div>

        {/* AI Processing Info */}
        <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3b82f6]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0f172a]">AI 자동 분석</p>
              <p className="mt-0.5 text-xs text-[#64748b]">
                업로드된 도면에서 표제란과 부품표를 자동으로 인식하여 BOM을 생성합니다.
                기존 데이터와 충돌이 발생하면 알려드립니다.
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {files.map((file) => (
              <FileItem key={file.id} file={file} onRemove={removeFile} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-[#f1f5f9] pt-4">
          <Button variant="outline" onClick={closeModal}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FileItem({
  file,
  onRemove,
}: {
  file: UploadFile;
  onRemove: (id: string) => void;
}) {
  const statusConfig: Record<
    string,
    { icon: typeof CheckCircle2; color: string; bg: string; label: string }
  > = {
    pending: { icon: FileText, color: "text-[#64748b]", bg: "bg-[#f1f5f9]", label: "대기 중" },
    uploading: { icon: Loader2, color: "text-[#3b82f6]", bg: "bg-[#eff6ff]", label: "업로드 중" },
    processing: { icon: Sparkles, color: "text-[#8b5cf6]", bg: "bg-[#f5f3ff]", label: "AI 분석 중" },
    completed: { icon: CheckCircle2, color: "text-[#22c55e]", bg: "bg-[#f0fdf4]", label: "완료" },
    failed: { icon: AlertTriangle, color: "text-[#ef4444]", bg: "bg-[#fef2f2]", label: "실패" },
    conflict: { icon: AlertTriangle, color: "text-[#f59e0b]", bg: "bg-[#fffbeb]", label: "충돌 감지" },
  };

  const config = statusConfig[file.status];
  const StatusIcon = config.icon;
  const isLoading = file.status === "uploading" || file.status === "processing";

  return (
    <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.bg)}>
          <StatusIcon
            className={cn("h-5 w-5", config.color, isLoading && "animate-spin")}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-medium text-[#0f172a]">{file.name}</p>
            <span className={cn("ml-2 shrink-0 text-xs font-medium", config.color)}>
              {config.label}
            </span>
          </div>

          {/* Progress */}
          {file.status === "uploading" && (
            <div className="mt-2">
              <Progress value={file.progress} className="h-1.5" />
              <p className="mt-1 text-[10px] text-[#64748b]">
                {Math.round(file.progress)}% 업로드됨
              </p>
            </div>
          )}

          {/* AI Progress */}
          {file.status === "processing" && file.aiProgress && (
            <div className="mt-2">
              <Progress value={file.aiProgress.percentage} className="h-1.5" />
              <p className="mt-1 text-[10px] text-[#64748b]">{file.aiProgress.step}</p>
            </div>
          )}

          {/* Result */}
          {file.status === "completed" && file.result && (
            <p className="mt-1 text-xs text-[#22c55e]">
              {file.result.itemsFound}개 아이템 추출 완료
            </p>
          )}

          {/* Conflict */}
          {file.status === "conflict" && file.result && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-xs text-[#f59e0b]">
                {file.result.conflictsFound}건 충돌 · {file.result.itemsFound}개 아이템
              </p>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <RefreshCw className="mr-1 h-3 w-3" />
                해결하기
              </Button>
            </div>
          )}

          {/* Error */}
          {file.status === "failed" && file.error && (
            <p className="mt-1 text-xs text-[#ef4444]">{file.error}</p>
          )}
        </div>

        {/* Remove Button */}
        {(file.status === "completed" || file.status === "failed") && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-[#94a3b8] hover:text-[#64748b]"
            onClick={() => onRemove(file.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
