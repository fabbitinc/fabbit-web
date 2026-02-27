import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { useUploadStore, type UploadFile } from "@/stores/uploadStore";
import { cn } from "@/lib/utils";

export function UploadModal() {
  const { isModalOpen, closeModal, files, addFiles, removeFile } = useUploadStore();

  const filterFile = (file: File) =>
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files).filter(filterFile);
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files ?? []);
      if (selectedFiles.length > 0) {
        addFiles(selectedFiles);
      }
      e.target.value = "";
    },
    [addFiles],
  );

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-[#3b82f6]" />
            도면 업로드
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
            accept=".pdf"
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
                PDF 파일 지원 · 최대 50MB
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
                업로드된 도면에서 표제란과 부품표를 자동으로 인식하여 BOM을 생성합니다. 기존 데이터와 충돌이 발생하면 알려드립니다.
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onRemove={removeFile}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end border-t border-[#f1f5f9] pt-4">
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
  const isLoading = file.status === "uploading" || file.status === "analyzing";
  const isCompleted = file.status === "completed";
  const isFailed = file.status === "failed";

  return (
    <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
            isLoading && "bg-[#8b5cf6]/10",
            isCompleted && "bg-[#22c55e]/10",
            isFailed && "bg-[#ef4444]/10",
            !isLoading && !isCompleted && !isFailed && "bg-[#f1f5f9]",
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-[#8b5cf6] animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
          ) : isFailed ? (
            <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
          ) : (
            <FileText className="h-5 w-5 text-[#64748b]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-[#0f172a]">{file.name}</p>

          <p
            key={`${file.status}-${file.statusMessage}`}
            className={cn(
              "mt-0.5 text-xs animate-fade-in-up",
              isLoading && "text-[#8b5cf6]",
              isCompleted && "text-[#22c55e]",
              isFailed && "text-[#ef4444]",
              !isLoading && !isCompleted && !isFailed && "text-[#64748b]",
            )}
          >
            {file.status === "pending" && "대기 중..."}
            {isLoading && file.statusMessage}
            {isCompleted && (file.statusMessage ?? "분석 완료")}
            {isFailed && (file.error ?? "오류 발생")}
          </p>
        </div>

        {isFailed && (
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
