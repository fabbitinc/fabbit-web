import { Download, ExternalLink, FileText, Layers, Loader2, Settings2 } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  cn,
} from "@fabbit/ui";
import {
  PartPreviewSettingsDialog,
  type PartPreviewSettingsDialogProps,
} from "./part-preview-settings-dialog";

export interface PartDrawingPreviewWebViewRequirement {
  title: string;
  description?: string | null;
}

export interface PartDrawingPreviewDrawing {
  drawingNumber: string | null;
  name: string | null;
  version: string | null;
  status: string | null;
  conversionStatus: string | null;
  viewerType: "PDF" | "GLB" | null;
  viewerUrl: string | null;
  previewUrl: string | null;
  originalFileUrl: string | null;
  failureMessage?: string | null;
  webViewRequirement?: PartDrawingPreviewWebViewRequirement | null;
}

export interface PartDrawingPreviewPart {
  partNumber: string;
  drawing: PartDrawingPreviewDrawing | null;
}

export type PartDrawingPreviewActivityState = "idle" | "uploading" | "processing";

export interface PartDrawingPreviewProps {
  activityState: PartDrawingPreviewActivityState;
  part: PartDrawingPreviewPart;
  previewSettings?: Omit<PartPreviewSettingsDialogProps, "open" | "onOpenChange"> & {
    isAvailable: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };
  onOpenViewer?: (drawing: PartDrawingPreviewDrawing) => void;
}

const DRAWING_PREVIEW_FRAME_CLASSNAME =
  "relative h-[clamp(36rem,50vw,42rem)] w-full shrink-0 overflow-hidden rounded-lg border";

function getFileNameFromUrl(url: string | null | undefined, fallback: string) {
  if (!url) {
    return fallback;
  }

  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split("/").pop() || fallback);
  } catch {
    return fallback;
  }
}

function DrawingProcessingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex h-full w-full flex-col p-6">
      <div className="absolute inset-x-12 top-4 h-24 rounded-full bg-primary/14 blur-3xl" />

      <div className="relative flex flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-primary/18 blur-2xl" />
          <div className="relative flex size-[4.5rem] items-center justify-center rounded-full border border-primary/20 bg-background/90">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        </div>

        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function DrawingFailedState({ description }: { description: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border border-destructive/20 bg-destructive/5">
        <FileText className="size-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-foreground">
          미리보기 생성에 실패했습니다
        </p>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function DrawingEmptyState({
  canConfigurePreview,
  onOpenSettings,
}: {
  canConfigurePreview: boolean;
  onOpenSettings: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="relative">
        <FileText className="size-14 text-muted-foreground/35" strokeWidth={1} />
        <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Layers className="size-3" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-foreground">대표 미리보기가 없습니다</p>
        <p className="text-sm leading-6 text-muted-foreground">
          파일 탭에서 연결된 도면이나 파일을 미리보기로 선택할 수 있습니다.
        </p>
      </div>
      {canConfigurePreview ? (
        <Button size="sm" type="button" variant="outline" onClick={onOpenSettings}>
          <Settings2 className="size-4" />
          미리보기 설정
        </Button>
      ) : null}
    </div>
  );
}

function DrawingOriginalFileState({
  fileName,
  requirement,
  canConfigurePreview,
  onOpenSettings,
}: {
  fileName: string;
  requirement?: PartDrawingPreviewWebViewRequirement | null;
  canConfigurePreview: boolean;
  onOpenSettings: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="relative">
        <FileText className="size-14 text-muted-foreground/35" strokeWidth={1} />
        <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Layers className="size-3" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-foreground">{fileName}</p>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          {requirement?.description ?? "현재 소스로는 웹 미리보기 산출물이 없습니다."}
        </p>
      </div>
      {canConfigurePreview ? (
        <Button size="sm" type="button" variant="outline" onClick={onOpenSettings}>
          <Settings2 className="size-4" />
          미리보기 설정
        </Button>
      ) : null}
    </div>
  );
}

export function PartDrawingPreview({
  activityState,
  part,
  previewSettings,
  onOpenViewer,
}: PartDrawingPreviewProps) {
  const drawing = part.drawing;
  const hasDrawing = drawing != null;
  const canConfigurePreview = previewSettings?.isAvailable ?? false;
  const isUploading = activityState === "uploading";
  const isProcessing = activityState === "processing";
  const isBusy = isUploading || isProcessing;

  async function handleDownload(url: string) {
    try {
      const pathname = new URL(url).pathname;
      const fallbackName = drawing?.drawingNumber ?? part.partNumber;
      const filename = decodeURIComponent(pathname.split("/").pop() || fallbackName);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function openViewer(targetDrawing: PartDrawingPreviewDrawing) {
    if (!targetDrawing.viewerUrl) {
      return;
    }

    if (onOpenViewer) {
      onOpenViewer(targetDrawing);
      return;
    }

    window.open(targetDrawing.viewerUrl, "_blank", "noopener,noreferrer");
  }

  const downloadOptions = hasDrawing
    ? [
        {
          label: "원본 다운로드",
          url: drawing.originalFileUrl,
          icon: Download,
        },
        drawing.viewerType === "PDF"
          ? {
              label: "PDF 다운로드",
              url: drawing.viewerUrl,
              icon: Download,
            }
          : drawing.viewerType === "GLB"
            ? {
                label: "GLB 다운로드",
                url: drawing.viewerUrl,
                icon: Download,
              }
            : null,
        {
          label: "이미지 다운로드",
          url: drawing.previewUrl,
          icon: Download,
        },
      ].filter((item): item is { label: string; url: string; icon: typeof Download } => Boolean(item?.url))
    : [];

  const viewerActionLabel =
    drawing?.viewerType === "GLB"
      ? "3D 보기"
      : drawing?.viewerType === "PDF"
        ? "PDF 보기"
        : "뷰어 보기";
  const showTopRightPreviewButton =
    canConfigurePreview &&
    (isBusy || drawing?.conversionStatus === "FAILED" || Boolean(drawing?.previewUrl));

  return (
    <>
      <div
        className={cn(
          DRAWING_PREVIEW_FRAME_CLASSNAME,
          hasDrawing ? "bg-muted/20" : "bg-muted/10",
          isBusy && "border-primary/20 bg-primary/5",
          drawing?.conversionStatus === "FAILED" && "border-destructive/25 bg-destructive/5",
          !isBusy && drawing?.conversionStatus !== "FAILED" && "border-border/70",
        )}
      >
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          {downloadOptions.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" type="button" variant="outline">
                  <Download className="size-4" />
                  다운로드
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[168px]">
                {downloadOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.label}
                    onClick={() => {
                      void handleDownload(option.url);
                    }}
                  >
                    <option.icon className="mr-2 size-4" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {showTopRightPreviewButton ? (
            <Button
              disabled={previewSettings?.isSubmitting || previewSettings?.isUploading}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => previewSettings?.onOpenChange(true)}
            >
              {(previewSettings?.isSubmitting || previewSettings?.isUploading) ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Settings2 className="size-4" />
              )}
              미리보기 설정
            </Button>
          ) : null}
        </div>

        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            drawing?.previewUrl ? "cursor-pointer p-4" : "p-0",
          )}
          onClick={
            drawing?.viewerUrl && drawing.previewUrl
              ? () => openViewer(drawing)
              : undefined
          }
        >
          {!hasDrawing ? (
            <DrawingEmptyState
              canConfigurePreview={canConfigurePreview}
              onOpenSettings={() => previewSettings?.onOpenChange(true)}
            />
          ) : drawing.conversionStatus === "FAILED" ? (
            <DrawingFailedState
              description={
                drawing.failureMessage ??
                "미리보기 생성에 실패했습니다. 다른 소스를 선택해 주세요."
              }
            />
          ) : isBusy ? (
            <DrawingProcessingState
              title={isUploading ? "미리보기 파일을 등록하고 있습니다" : "미리보기를 준비하고 있습니다"}
              description={
                isUploading
                  ? "업로드 완료 후 대표 미리보기에 바로 반영합니다."
                  : "대표 미리보기 산출물을 준비하고 있습니다."
              }
            />
          ) : drawing.previewUrl ? (
            <img
              alt={drawing.name ?? drawing.drawingNumber ?? part.partNumber}
              className="block max-h-full max-w-full object-contain"
              src={drawing.previewUrl}
            />
          ) : drawing.originalFileUrl ? (
            <DrawingOriginalFileState
              canConfigurePreview={canConfigurePreview}
              fileName={getFileNameFromUrl(
                drawing.originalFileUrl,
                drawing.name ?? drawing.drawingNumber ?? part.partNumber,
              )}
              requirement={drawing.webViewRequirement}
              onOpenSettings={() => previewSettings?.onOpenChange(true)}
            />
          ) : (
            <DrawingEmptyState
              canConfigurePreview={canConfigurePreview}
              onOpenSettings={() => previewSettings?.onOpenChange(true)}
            />
          )}
        </div>

        {drawing?.drawingNumber && drawing.previewUrl ? (
          <div className="absolute bottom-3 left-3">
            <span className="rounded bg-background/85 px-2 py-1 font-mono text-[10px] text-muted-foreground shadow-sm">
              {drawing.drawingNumber}
            </span>
          </div>
        ) : null}

        {drawing?.viewerUrl && drawing.previewUrl ? (
          <div className="absolute bottom-3 right-3">
            <span className="flex h-7 items-center gap-1.5 rounded bg-background/85 px-2.5 text-muted-foreground shadow-sm">
              <ExternalLink className="size-3" />
              <span className="text-[10px]">{viewerActionLabel}</span>
            </span>
          </div>
        ) : null}
      </div>

      {previewSettings ? (
        <PartPreviewSettingsDialog
          isLoading={previewSettings.isLoading}
          isSubmitting={previewSettings.isSubmitting}
          isUploading={previewSettings.isUploading}
          open={previewSettings.open}
          sources={previewSettings.sources}
          onClearSelection={previewSettings.onClearSelection}
          onDeletePreviewFile={previewSettings.onDeletePreviewFile}
          onOpenChange={previewSettings.onOpenChange}
          onSelectSource={previewSettings.onSelectSource}
          onUploadPreviewFile={previewSettings.onUploadPreviewFile}
        />
      ) : null}
    </>
  );
}
