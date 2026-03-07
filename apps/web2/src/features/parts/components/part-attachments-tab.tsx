import { useRef, useState } from "react";
import { FileIcon } from "@fabbit/components";
import { Download, Trash2, Upload } from "lucide-react";
import { Button, ConfirmDialog } from "@fabbit/ui";
import { useAttachPartFilesAction } from "@/features/parts/hooks/use-attach-part-files-action";
import { useDetachPartFileAction } from "@/features/parts/hooks/use-detach-part-file-action";
import { usePartFilesQuery } from "@/features/parts/hooks/use-part-files-query";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface PartAttachmentsTabProps {
  partId: string;
}

export function PartAttachmentsTab({ partId }: PartAttachmentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesQuery = usePartFilesQuery(partId);
  const attachPartFilesAction = useAttachPartFilesAction(partId);
  const detachPartFileAction = useDetachPartFileAction(partId);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const deletingFile = filesQuery.data?.find((file) => file.fileId === deletingFileId) ?? null;

  return (
    <>
      <section className="app-panel rounded-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">첨부 파일</p>
            <p className="mt-1 text-sm text-muted-foreground">파일을 업로드하고 삭제할 수 있습니다.</p>
          </div>
          <Button
            disabled={attachPartFilesAction.isPending}
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            파일 추가
          </Button>
        </div>

        <input
          ref={fileInputRef}
          aria-label="부품 첨부 파일 업로드"
          className="hidden"
          multiple
          type="file"
          onChange={async (event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length > 0) {
              try {
                await attachPartFilesAction.mutateAsync(files);
              } finally {
                event.target.value = "";
              }
            }
          }}
        />

        <div className="mt-4 space-y-2">
          {filesQuery.isLoading ? <p className="text-sm text-muted-foreground">첨부파일을 불러오는 중입니다.</p> : null}
          {!filesQuery.isLoading && (filesQuery.data?.length ?? 0) === 0 ? (
            <p className="rounded-md border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
              첨부파일이 없습니다.
            </p>
          ) : null}
          {filesQuery.data?.map((file) => (
            <div key={file.fileId} className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-card px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-full bg-muted/70 p-2">
                  <FileIcon contentType={file.contentType} name={file.originalName} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{file.originalName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatFileSize(file.fileSize)} · {formatDateTime(file.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {file.fileUrl ? (
                  <Button type="button" variant="outline" onClick={() => window.open(file.fileUrl ?? "", "_blank", "noreferrer")}>
                    <Download className="size-4" />
                    다운로드
                  </Button>
                ) : null}
                <Button type="button" variant="outline" onClick={() => setDeletingFileId(file.fileId)}>
                  <Trash2 className="size-4" />
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(deletingFileId)}
        title="첨부파일을 삭제할까요?"
        description={deletingFile ? `${deletingFile.originalName} 파일 연결을 제거합니다.` : "선택한 파일 연결을 제거합니다."}
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setDeletingFileId(null)}
        onConfirm={() => {
          if (!deletingFileId) {
            return;
          }

          detachPartFileAction.mutate(deletingFileId, {
            onSuccess: () => setDeletingFileId(null),
          });
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingFileId(null);
          }
        }}
      />
    </>
  );
}
