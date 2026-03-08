import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { Button, ConfirmDialog } from "@fabbit/ui";
import { FileIcon } from "./file-icon";

export interface PartAttachmentItem {
  fileId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
}

export interface PartAttachmentsTabProps {
  files: PartAttachmentItem[];
  isDeleting?: boolean;
  isLoading?: boolean;
  isUploading?: boolean;
  onDeleteFile: (fileId: string) => Promise<void> | void;
  onUploadFiles: (files: File[]) => Promise<void> | void;
}

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

export function PartAttachmentsTab({
  files,
  isDeleting = false,
  isLoading = false,
  isUploading = false,
  onDeleteFile,
  onUploadFiles,
}: PartAttachmentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const deletingFile = files.find((file) => file.fileId === deletingFileId) ?? null;

  return (
    <>
      <section className="app-panel rounded-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">첨부 파일</p>
            <p className="mt-1 text-sm text-muted-foreground">파일을 업로드하고 삭제할 수 있습니다.</p>
          </div>
          <Button
            disabled={isUploading}
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
            const nextFiles = Array.from(event.target.files ?? []);

            if (nextFiles.length === 0) {
              return;
            }

            try {
              await Promise.resolve(onUploadFiles(nextFiles));
            } finally {
              event.target.value = "";
            }
          }}
        />

        <div className="mt-4 space-y-2">
          {isLoading ? <p className="text-sm text-muted-foreground">첨부파일을 불러오는 중입니다.</p> : null}
          {!isLoading && files.length === 0 ? (
            <p className="rounded-md border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
              첨부파일이 없습니다.
            </p>
          ) : null}
          {files.map((file) => (
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
                  <Button asChild variant="outline">
                    <a href={file.fileUrl} rel="noreferrer" target="_blank">
                      <Download className="size-4" />
                      다운로드
                    </a>
                  </Button>
                ) : null}
                <Button
                  disabled={isDeleting}
                  type="button"
                  variant="outline"
                  onClick={() => setDeletingFileId(file.fileId)}
                >
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

          void Promise.resolve(onDeleteFile(deletingFileId));
          setDeletingFileId(null);
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
