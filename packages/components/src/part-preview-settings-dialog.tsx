import { useMemo, useRef, useState } from "react";
import { Check, Loader2, Trash2, Upload } from "lucide-react";
import {
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  cn,
} from "@fabbit/ui";
import { FileIcon } from "./file-icon";

export type PartPreviewSettingsSourceType = "DRAWING" | "PREVIEW_FILE";

export interface PartPreviewSettingsSource {
  sourceId: string;
  sourceType: PartPreviewSettingsSourceType;
  attachmentType: PartPreviewSettingsSourceType;
  previewFileId: string | null;
  fileId: string | null;
  drawingId: string | null;
  originalName: string;
  contentType: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  selected: boolean;
  deletable: boolean;
  createdAt: string | null;
}

export interface PartPreviewSettingsDialogProps {
  open: boolean;
  isLoading?: boolean;
  isSubmitting?: boolean;
  isUploading?: boolean;
  sources: PartPreviewSettingsSource[];
  onOpenChange: (open: boolean) => void;
  onSelectSource: (
    source: Pick<PartPreviewSettingsSource, "sourceId" | "sourceType">,
  ) => Promise<void> | void;
  onClearSelection: () => Promise<void> | void;
  onUploadPreviewFile: (file: File) => Promise<void> | void;
  onDeletePreviewFile: (previewFileId: string) => Promise<void> | void;
}

const PREVIEW_UPLOAD_ACCEPT = [
  ".png",
  ".jpg",
  ".jpeg",
  ".bmp",
  ".tif",
  ".tiff",
  ".webp",
  ".pdf",
  ".glb",
  ".gltf",
] as const;

function formatFileSize(fileSize: number | null) {
  if (fileSize == null || Number.isNaN(fileSize) || fileSize <= 0) {
    return null;
  }

  if (fileSize < 1024) {
    return `${fileSize}B`;
  }

  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(1)}KB`;
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)}MB`;
}

function getPreviewSourceLabel(source: PartPreviewSettingsSource) {
  return source.attachmentType === "PREVIEW_FILE" ? "미리보기 전용" : "도면";
}

function SourceListSection({
  title,
  sources,
  isBusy,
  onSelectSource,
  onClearSelection,
  onDeleteSource,
}: {
  title: string;
  sources: PartPreviewSettingsSource[];
  isBusy: boolean;
  onSelectSource: PartPreviewSettingsDialogProps["onSelectSource"];
  onClearSelection: PartPreviewSettingsDialogProps["onClearSelection"];
  onDeleteSource: (previewFileId: string) => void;
}) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <div className="px-1">
        <h3 className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {title}
        </h3>
      </div>
      <div className="space-y-2">
        {sources.map((source) => (
          <div
            key={`${source.sourceType}:${source.sourceId}`}
            className={cn(
              "flex items-start justify-between gap-4 rounded-lg border px-4 py-3 transition-colors",
              source.selected
                ? "border-primary/40 bg-primary/5"
                : "border-border/70 bg-card",
            )}
          >
            <div className="min-w-0 flex flex-1 items-start gap-3">
              <FileIcon
                className="mt-0.5 size-4"
                contentType={source.contentType ?? undefined}
                name={source.originalName}
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {source.originalName}
                  </p>
                  {source.selected ? (
                    <Badge variant="default" className="shrink-0">
                      <Check className="size-3" />
                      현재 선택
                    </Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge
                    variant={
                      source.attachmentType === "PREVIEW_FILE"
                        ? "info"
                        : "outline"
                    }
                  >
                    {getPreviewSourceLabel(source)}
                  </Badge>
                  {formatFileSize(source.fileSize) ? (
                    <span>{formatFileSize(source.fileSize)}</span>
                  ) : null}
                  {!source.selected ? <span>선택 가능</span> : null}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-center">
              {source.selected ? (
                <Button
                  disabled={isBusy}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void Promise.resolve(onClearSelection());
                  }}
                >
                  해제
                </Button>
              ) : (
                <Button
                  disabled={isBusy}
                  size="sm"
                  type="button"
                  onClick={() => {
                    void Promise.resolve(
                      onSelectSource({
                        sourceId: source.sourceId,
                        sourceType: source.sourceType,
                      }),
                    );
                  }}
                >
                  대표로 설정
                </Button>
              )}
              {source.deletable && source.previewFileId ? (
                <Button
                  aria-label="삭제"
                  disabled={isBusy}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDeleteSource(source.previewFileId!)}
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PartPreviewSettingsDialog({
  open,
  isLoading = false,
  isSubmitting = false,
  isUploading = false,
  sources,
  onOpenChange,
  onSelectSource,
  onClearSelection,
  onUploadPreviewFile,
  onDeletePreviewFile,
}: PartPreviewSettingsDialogProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [pendingDeletePreviewFileId, setPendingDeletePreviewFileId] =
    useState<string | null>(null);
  const isBusy = isSubmitting || isUploading;

  const drawingSources = useMemo(
    () => sources.filter((source) => source.attachmentType === "DRAWING"),
    [sources],
  );
  const previewFileSources = useMemo(
    () => sources.filter((source) => source.attachmentType === "PREVIEW_FILE"),
    [sources],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden p-0 sm:max-w-[920px]"
        >
          <DialogHeader className="gap-0 border-b border-border/60 px-6 py-5">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <DialogTitle>미리보기 설정</DialogTitle>
                <DialogDescription>
                  대표 미리보기로 사용할 도면을 고르거나, 미리보기 전용 파일을
                  따로 등록할 수 있습니다.
                </DialogDescription>
              </div>
              <Button
                disabled={isBusy}
                size="sm"
                type="button"
                variant="outline"
                className="self-start"
                onClick={() => uploadInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                미리보기 파일 업로드
              </Button>
            </div>
          </DialogHeader>

          <input
            ref={uploadInputRef}
            accept={PREVIEW_UPLOAD_ACCEPT.join(",")}
            className="hidden"
            type="file"
            onChange={async (event) => {
              const file = event.target.files?.[0];

              if (!file) {
                return;
              }

              try {
                await Promise.resolve(onUploadPreviewFile(file));
              } finally {
                event.target.value = "";
              }
            }}
          />

          <div className="px-6 py-5">
            {isLoading ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-border/60 bg-muted/10">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  미리보기 소스를 불러오는 중
                </div>
              </div>
            ) : sources.length === 0 ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 px-6 text-center text-sm text-muted-foreground">
                선택할 수 있는 미리보기 소스가 없습니다.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border/70 bg-muted/10">
                <ScrollArea className="h-[460px]">
                  <div className="space-y-5 p-4">
                    <SourceListSection
                      title="미리보기 전용 파일"
                      sources={previewFileSources}
                      isBusy={isBusy}
                      onSelectSource={onSelectSource}
                      onClearSelection={onClearSelection}
                      onDeleteSource={setPendingDeletePreviewFileId}
                    />
                    <SourceListSection
                      title="도면"
                      sources={drawingSources}
                      isBusy={isBusy}
                      onSelectSource={onSelectSource}
                      onClearSelection={onClearSelection}
                      onDeleteSource={setPendingDeletePreviewFileId}
                    />
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border/60 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDeletePreviewFileId != null}
        title="미리보기 파일을 삭제할까요?"
        description="미리보기 전용 파일을 삭제합니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setPendingDeletePreviewFileId(null)}
        onConfirm={() => {
          if (!pendingDeletePreviewFileId) {
            return;
          }

          void Promise.resolve(
            onDeletePreviewFile(pendingDeletePreviewFileId),
          );
          setPendingDeletePreviewFileId(null);
        }}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPendingDeletePreviewFileId(null);
          }
        }}
      />
    </>
  );
}
