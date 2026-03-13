import { useRef, useState, type DragEvent, type ReactNode } from "react";
import {
  AlertCircle,
  Download,
  ExternalLink,
  FileDown,
  FileText,
  ImageDown,
  Layers,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  cn,
} from "@fabbit/ui";

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

export type PartDrawingPreviewActivityState =
  | "idle"
  | "uploading"
  | "processing";

export interface PartDrawingPreviewProps {
  activityState: PartDrawingPreviewActivityState;
  part: PartDrawingPreviewPart;
  isDeleting: boolean;
  onDelete: () => void;
  onOpenViewer?: (drawing: PartDrawingPreviewDrawing) => void;
  onUpload: (file: File) => void;
}

const DRAWING_EXTENSION_GROUPS = [
  {
    label: "2D",
    uploadableExtensions: [".dwg", ".dxf", ".pdf"],
    additionalWorkExtensions: [".dwg"],
  },
  {
    label: "이미지",
    uploadableExtensions: [
      ".png",
      ".jpg",
      ".jpeg",
      ".bmp",
      ".tif",
      ".tiff",
      ".webp",
    ],
    additionalWorkExtensions: [],
  },
  {
    label: "3D",
    uploadableExtensions: [
      ".sldprt",
      ".sldasm",
      ".step",
      ".stp",
      ".iges",
      ".igs",
      ".brep",
      ".brp",
      ".stl",
      ".obj",
      ".3mf",
      ".fbx",
      ".glb",
      ".gltf",
    ],
    additionalWorkExtensions: [".sldprt", ".sldasm"],
  },
] as const;

const DRAWING_ACCEPT: readonly string[] = Array.from(
  new Set(
    DRAWING_EXTENSION_GROUPS.flatMap((group) => group.uploadableExtensions),
  ),
);

const DRAWING_ADDITIONAL_WORK_EXTENSION_SET: ReadonlySet<string> = new Set(
  DRAWING_EXTENSION_GROUPS.flatMap((group) => group.additionalWorkExtensions),
);

const TWO_D_DRAWING_EXTENSION_GROUP = DRAWING_EXTENSION_GROUPS.find(
  (group) => group.label === "2D",
);
const IMAGE_DRAWING_EXTENSION_GROUP = DRAWING_EXTENSION_GROUPS.find(
  (group) => group.label === "이미지",
);
const THREE_D_DRAWING_EXTENSION_GROUP = DRAWING_EXTENSION_GROUPS.find(
  (group) => group.label === "3D",
);

function isAcceptedFile(file: File) {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  return DRAWING_ACCEPT.includes(ext);
}

function getFileExtensionLabel(fileName: string) {
  const fileNameSegments = fileName.split(".");

  if (fileNameSegments.length < 2) {
    return null;
  }

  return fileNameSegments.at(-1)?.toLowerCase() ?? null;
}

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

const DRAWING_PREVIEW_FRAME_CLASSNAME =
  "relative h-[clamp(36rem,50vw,42rem)] w-full shrink-0 overflow-hidden rounded-lg";

function DrawingPreviewSection({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}

function DrawingFormatSummary({ compact = false }: { compact?: boolean }) {
  const additionalWorkExtensions = Array.from(
    DRAWING_ADDITIONAL_WORK_EXTENSION_SET,
  ).map((extension) => extension.toUpperCase().slice(1));

  function renderExtensions(extensions: readonly string[]) {
    return extensions.map((extension, index) => {
      const uppercasedExtension = extension.toUpperCase().slice(1);
      const requiresAdditionalWork =
        DRAWING_ADDITIONAL_WORK_EXTENSION_SET.has(extension);

      return (
        <span
          key={extension}
          className={cn(
            requiresAdditionalWork && "font-medium text-status-warning",
          )}
        >
          {uppercasedExtension}
          {index < extensions.length - 1 ? ", " : ""}
        </span>
      );
    });
  }

  return (
    <div className={cn("space-y-3", compact && "space-y-2.5")}>
      <div className="space-y-2 text-xs leading-6 text-muted-foreground">
        <p>
          <span className="mr-2 font-medium text-foreground/80">2D</span>
          {renderExtensions([
            ...(TWO_D_DRAWING_EXTENSION_GROUP?.uploadableExtensions ?? []),
            ...(IMAGE_DRAWING_EXTENSION_GROUP?.uploadableExtensions ?? []),
          ])}
        </p>
        <p>
          <span className="mr-2 font-medium text-foreground/80">3D</span>
          {renderExtensions(
            THREE_D_DRAWING_EXTENSION_GROUP?.uploadableExtensions ?? [],
          )}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-status-warning">
          {additionalWorkExtensions.join(", ")} 확장자는 원본은 저장되지만
          웹에서 보려면 추가 파일이 필요합니다.
        </p>
      </div>
    </div>
  );
}

function DrawingEmptyState({ isDragging }: { isDragging: boolean }) {
  return (
    <div className="relative flex h-full w-full flex-col p-6 text-left">
      <div
        className={cn(
          "absolute inset-x-12 top-4 h-24 rounded-full blur-3xl transition-opacity",
          isDragging ? "bg-primary/18 opacity-100" : "bg-primary/10 opacity-70",
        )}
      />

      <div className="relative flex flex-1 flex-col items-center justify-center py-5 text-center">
        <div className="relative mb-4">
          <div
            className={cn(
              "absolute inset-0 rounded-[24px] blur-2xl transition-opacity",
              isDragging
                ? "bg-primary/22 opacity-100"
                : "bg-primary/10 opacity-70",
            )}
          />
          <div
            className={cn(
              "relative flex size-[4.5rem] items-center justify-center rounded-[24px] border bg-background/90 transition-colors",
              isDragging ? "border-primary/35" : "border-border/70",
            )}
          >
            <Upload
              className={cn(
                "size-8 transition-colors",
                isDragging ? "text-primary" : "text-primary/70",
              )}
            />
          </div>
        </div>

        <p className="text-lg font-semibold text-foreground">
          {isDragging ? "여기에 파일을 놓으세요" : "도면 또는 3D 파일 등록"}
        </p>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
          클릭 업로드 또는 드래그 앤 드롭
        </p>
      </div>

      <div className="relative rounded-xl border border-border/60 bg-background/70 p-3">
        <div className="mb-2 flex items-center">
          <p className="text-xs font-medium text-foreground">
            업로드 가능한 확장자
          </p>
        </div>
        <DrawingFormatSummary compact />
      </div>
    </div>
  );
}

function DrawingProcessingState({
  description,
  title,
}: {
  description: string;
  title: string;
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
    <div className="relative flex h-full w-full flex-col p-6">
      <div className="absolute inset-x-12 top-4 h-24 rounded-full bg-destructive/12 blur-3xl" />

      <div className="relative flex flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="mb-5 flex size-[4.5rem] items-center justify-center rounded-full border border-destructive/15 bg-background/90">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <p className="text-lg font-semibold text-foreground">
          미리보기 생성에 실패했습니다
        </p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function DrawingActionRequiredFooter({
  description,
  title,
  onUpload,
}: {
  description?: string | null;
  title: string;
  onUpload: () => void;
}) {
  return (
    <button
      type="button"
      className="absolute inset-x-4 bottom-4 z-10 flex cursor-pointer items-start gap-3 rounded-xl border border-status-warning-border bg-background/90 p-3 text-left shadow-sm backdrop-blur-sm transition-colors hover:bg-status-warning-bg/40"
      onClick={onUpload}
    >
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-status-warning-bg text-status-warning">
        <Upload className="h-4 w-4" />
      </div>

      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
        <p className="text-xs leading-5 text-muted-foreground">
          클릭 업로드 또는 도면 미리보기 영역에 드래그 앤 드롭
        </p>
      </div>
    </button>
  );
}

function DrawingOriginalFileState({
  fileName,
  isDragging,
  onDownload,
}: {
  fileName: string;
  isDragging: boolean;
  onDownload?: () => void;
}) {
  if (isDragging) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <p className="text-lg font-semibold text-foreground">
          여기에 파일을 놓으세요
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-semibold text-foreground">{fileName}</p>
      {onDownload ? (
        <Button type="button" onClick={onDownload}>
          <Download className="h-4 w-4" />
          원본 다운로드
        </Button>
      ) : null}
    </div>
  );
}

function UnsupportedDrawingFormatDialog({
  fileName,
  open,
  onOpenChange,
}: {
  fileName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const extensionLabel = fileName ? getFileExtensionLabel(fileName) : null;
  const description = extensionLabel
    ? (
        <>
          <code className="mx-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
            {extensionLabel}
          </code>
          형식은 업로드할 수 없습니다. 지원 확장자를 확인해주세요.
        </>
      )
    : "지원하지 않는 파일 형식입니다. 지원 확장자를 확인해주세요.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>지원하지 않는 파일 형식입니다</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PartDrawingPreview({
  activityState,
  part,
  isDeleting,
  onDelete,
  onOpenViewer,
  onUpload,
}: PartDrawingPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [unsupportedFileName, setUnsupportedFileName] = useState<string | null>(
    null,
  );
  const drawing = part.drawing;
  const hasDrawing = drawing != null;
  const isUploading = activityState === "uploading";
  const isProcessing = activityState === "processing";
  const isBusy = isUploading || isProcessing;
  const canDelete = !isUploading;

  function openFilePicker() {
    if (isBusy) {
      return;
    }
    fileInputRef.current?.click();
  }

  function handleFile(file: File | null | undefined) {
    if (!file) {
      return;
    }

    if (!isAcceptedFile(file)) {
      setUnsupportedFileName(file.name);
      return;
    }

    onUpload(file);
  }

  async function handleDownload(url: string) {
    try {
      const pathname = new URL(url).pathname;
      const fallbackName = drawing?.drawingNumber ?? part.partNumber;
      const filename = decodeURIComponent(
        pathname.split("/").pop() || fallbackName,
      );
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

  function handleDelete() {
    if (!canDelete || isDeleting) {
      return;
    }

    if (!window.confirm("도면을 삭제하시겠습니까?")) {
      return;
    }

    onDelete();
  }

  function openViewer(targetDrawing: PartDrawingPreviewDrawing) {
    if (!targetDrawing.viewerUrl) {
      return;
    }

    if (targetDrawing.viewerType === "GLB" && onOpenViewer) {
      onOpenViewer(targetDrawing);
      return;
    }

    window.open(targetDrawing.viewerUrl, "_blank", "noopener,noreferrer");
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  if (hasDrawing) {
    const previewDrawing = drawing;
    const hasPreview = !!previewDrawing.previewUrl;
    const drawingNumberLabel = previewDrawing.drawingNumber?.trim() || null;
    const canOpenViewer = !!previewDrawing.viewerUrl;
    const isFailed = previewDrawing.conversionStatus === "FAILED";
    const failureDescription =
      previewDrawing.failureMessage ??
      "도면 처리에 실패했습니다. 파일 형식과 원본 상태를 확인해 주세요.";
    const viewerActionLabel =
      previewDrawing.viewerType === "GLB"
        ? "3D 보기"
        : previewDrawing.viewerType === "PDF"
          ? "PDF 보기"
          : "뷰어 보기";
    const originalFileName = getFileNameFromUrl(
      previewDrawing.originalFileUrl,
      previewDrawing.name ?? previewDrawing.drawingNumber ?? part.partNumber,
    );
    const webViewRequirement = previewDrawing.webViewRequirement ?? null;
    const isActionRequired =
      !!webViewRequirement &&
      !hasPreview &&
      !isBusy &&
      !isFailed &&
      !canOpenViewer;
    const supportsCentralUpload = isActionRequired;
    const downloadOptions = [
      {
        label: "원본 다운로드",
        icon: Download,
        url: previewDrawing.originalFileUrl,
      },
      previewDrawing.viewerType === "PDF"
        ? {
            label: "PDF 다운로드",
            icon: FileDown,
            url: previewDrawing.viewerUrl,
          }
        : previewDrawing.viewerType === "GLB"
          ? {
              label: "GLB 다운로드",
              icon: Layers,
              url: previewDrawing.viewerUrl,
            }
          : null,
      {
        label: "이미지 다운로드",
        icon: ImageDown,
        url: previewDrawing.previewUrl,
      },
    ].filter(
      (
        option,
      ): option is { label: string; icon: typeof Download; url: string } => {
        return option != null && option.url != null;
      },
    );

    return (
      <DrawingPreviewSection>
        <UnsupportedDrawingFormatDialog
          fileName={unsupportedFileName}
          open={unsupportedFileName != null}
          onOpenChange={(open) => {
            if (!open) {
              setUnsupportedFileName(null);
            }
          }}
        />

        <input
          ref={fileInputRef}
          accept={DRAWING_ACCEPT.join(",")}
          className="hidden"
          type="file"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <div
          className={cn(
            "group border",
            DRAWING_PREVIEW_FRAME_CLASSNAME,
            hasPreview && "bg-muted/20",
            isBusy && "border-primary/20 bg-primary/5",
            isFailed && "border-destructive/25 bg-destructive/5",
            isActionRequired && "border-status-warning-border bg-muted/10",
            !hasPreview &&
              !isBusy &&
              !isFailed &&
              !isActionRequired &&
              "bg-muted/20",
            supportsCentralUpload &&
              isDragging &&
              "border-primary bg-primary/5",
          )}
          onDragLeave={supportsCentralUpload ? handleDragLeave : undefined}
          onDragOver={supportsCentralUpload ? handleDragOver : undefined}
          onDrop={supportsCentralUpload ? handleDrop : undefined}
        >
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              hasPreview ? "p-4" : "p-0",
              isActionRequired && "pb-24",
              canOpenViewer && !isActionRequired && "cursor-pointer",
            )}
            onClick={canOpenViewer ? () => openViewer(previewDrawing) : undefined}
          >
            {hasPreview ? (
              <img
                alt={
                  previewDrawing.name ??
                  previewDrawing.drawingNumber ??
                  part.partNumber
                }
                className="block max-h-full max-w-full object-contain"
                src={previewDrawing.previewUrl ?? ""}
              />
            ) : isFailed ? (
              <DrawingFailedState description={failureDescription} />
            ) : isBusy ? (
              <DrawingProcessingState
                description={
                  isUploading
                    ? "파일 무결성을 확인하고 업로드를 진행하고 있습니다."
                    : "미리보기를 준비하고 있습니다."
                }
                title={
                  isUploading
                    ? "도면을 업로드하고 있습니다"
                    : "도면을 변환하고 있습니다"
                }
              />
            ) : isActionRequired ? (
              <DrawingOriginalFileState
                fileName={originalFileName}
                isDragging={isDragging}
                onDownload={
                  previewDrawing.originalFileUrl
                    ? () => {
                        void handleDownload(previewDrawing.originalFileUrl ?? "");
                      }
                    : undefined
                }
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                <div className="relative">
                  <FileText className="h-14 w-14" strokeWidth={1} />
                  <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Layers className="h-3 w-3" />
                  </div>
                </div>
                <span className="text-[10px]">도면 미리보기</span>
              </div>
            )}
          </div>

          {isActionRequired && webViewRequirement && !isDragging ? (
            <DrawingActionRequiredFooter
              description={webViewRequirement.description}
              title={webViewRequirement.title}
              onUpload={openFilePicker}
            />
          ) : null}

          <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            {!isActionRequired && downloadOptions.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex h-8 items-center gap-1.5 rounded-md bg-background/95 px-2.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Download className="h-3.5 w-3.5" />
                    다운로드
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[150px]">
                  {downloadOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.label}
                      onClick={() => handleDownload(option.url ?? "")}
                    >
                      <option.icon className="mr-2 h-4 w-4" />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            {canDelete ? (
              <button
                className="flex h-8 items-center gap-1.5 rounded-md bg-background/95 px-2.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-destructive/10 hover:text-destructive"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                삭제
              </button>
            ) : null}
          </div>

          {!isActionRequired && hasPreview && drawingNumberLabel ? (
            <div className="absolute bottom-2 left-2">
              <span className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-sm">
                {drawingNumberLabel}
              </span>
            </div>
          ) : null}

          {!isActionRequired && canOpenViewer ? (
            <div className="absolute bottom-2 right-2">
              <span className="flex h-6 items-center gap-1 rounded bg-background/80 px-2 text-muted-foreground shadow-sm">
                <ExternalLink className="h-3 w-3" />
                <span className="text-[10px]">{viewerActionLabel}</span>
              </span>
            </div>
          ) : null}
        </div>
      </DrawingPreviewSection>
    );
  }

  return (
    <DrawingPreviewSection>
      <UnsupportedDrawingFormatDialog
        fileName={unsupportedFileName}
        open={unsupportedFileName != null}
        onOpenChange={(open) => {
          if (!open) {
            setUnsupportedFileName(null);
          }
        }}
      />

      <input
        ref={fileInputRef}
        accept={DRAWING_ACCEPT.join(",")}
        className="hidden"
        type="file"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <button
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center transition-all",
          DRAWING_PREVIEW_FRAME_CLASSNAME,
          isBusy && "border border-primary/20 bg-primary/5",
          !isBusy &&
            (isDragging
              ? "border-2 border-dashed border-primary bg-primary/5"
              : "border-2 border-dashed border-muted-foreground/15 bg-muted/10 hover:border-primary/40 hover:bg-muted/20"),
        )}
        type="button"
        onClick={openFilePicker}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isBusy ? (
          <DrawingProcessingState
            description={
              isUploading
                ? "파일 무결성을 확인하고 업로드를 진행하고 있습니다."
                : "미리보기 산출물을 준비하고 있습니다."
            }
            title={
              isUploading
                ? "도면을 업로드하고 있습니다"
                : "도면을 변환하고 있습니다"
            }
          />
        ) : (
          <DrawingEmptyState isDragging={isDragging} />
        )}
      </button>
    </DrawingPreviewSection>
  );
}
