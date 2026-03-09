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
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  cn,
} from "@fabbit/ui";

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
}

export interface PartDrawingPreviewPart {
  partNumber: string;
  drawing: PartDrawingPreviewDrawing | null;
}

export interface PartDrawingPreviewProps {
  part: PartDrawingPreviewPart;
  isDeleting: boolean;
  isUploading: boolean;
  onDelete: () => void;
  onOpenViewer?: (drawing: PartDrawingPreviewDrawing) => void;
  onUpload: (file: File) => void;
}

const DRAWING_EXTENSION_GROUPS = [
  { label: "2D CAD", extensions: [".dwg", ".dxf"] },
  { label: "PDF", extensions: [".pdf"] },
  {
    label: "이미지",
    extensions: [".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp"],
  },
  {
    label: "3D CAD",
    extensions: [
      ".step",
      ".stp",
      ".iges",
      ".igs",
      ".stl",
      ".obj",
      ".3mf",
      ".fbx",
      ".glb",
      ".gltf",
    ],
  },
] as const;

const DRAWING_ACCEPT: string[] = DRAWING_EXTENSION_GROUPS.flatMap(
  (group) => group.extensions,
);

function isAcceptedFile(file: File) {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  return DRAWING_ACCEPT.includes(ext);
}

function formatExtensions(extensions: readonly string[]) {
  return extensions
    .map((extension) => extension.slice(1).toUpperCase())
    .join(", ");
}

const DRAWING_PREVIEW_FRAME_CLASSNAME =
  "relative h-[clamp(36rem,50vw,42rem)] w-full shrink-0 overflow-hidden rounded-lg";

function DrawingPreviewSection({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}

function DrawingFormatSummary({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 sm:grid-cols-2",
        !compact && "lg:gap-3",
      )}
    >
      {DRAWING_EXTENSION_GROUPS.map((group) => (
        <div
          key={group.label}
          className={cn(
            "rounded-xl border border-border/70 bg-background/80 p-3 text-left",
            compact && "bg-background/70 p-2.5",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/75">
              {group.label}
            </p>
            <Badge className="px-1.5 py-0 text-[10px]" variant="secondary">
              {group.extensions.length}종
            </Badge>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            {formatExtensions(group.extensions)}
          </p>
        </div>
      ))}
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
          <p className="text-xs font-medium text-foreground">지원 형식 요약</p>
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

export function PartDrawingPreview({
  part,
  isDeleting,
  isUploading,
  onDelete,
  onOpenViewer,
  onUpload,
}: PartDrawingPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const drawing = part.drawing;
  const hasDrawing = drawing != null;
  const isProcessing =
    isUploading ||
    drawing?.conversionStatus === "PENDING" ||
    drawing?.conversionStatus === "PROCESSING";

  function openFilePicker() {
    if (isProcessing) {
      return;
    }
    fileInputRef.current?.click();
  }

  function handleFile(file: File | null | undefined) {
    if (!file || !isAcceptedFile(file)) {
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
    if (isDeleting) {
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
            isProcessing && "border-primary/20 bg-primary/5",
            isFailed &&
              "cursor-pointer border-destructive/25 bg-destructive/5 hover:border-destructive/40",
            !hasPreview && !isProcessing && !isFailed && "bg-muted/20",
            isFailed && isDragging && "border-primary bg-primary/5",
          )}
          onDragLeave={isFailed ? handleDragLeave : undefined}
          onDragOver={isFailed ? handleDragOver : undefined}
          onDrop={isFailed ? handleDrop : undefined}
        >
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              hasPreview ? "p-4" : "p-0",
              (isFailed || canOpenViewer) && "cursor-pointer",
            )}
            onClick={
              isFailed
                ? openFilePicker
                : canOpenViewer
                  ? () => openViewer(previewDrawing)
                  : undefined
            }
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
            ) : isProcessing ? (
              <DrawingProcessingState
                description="미리보기를 준비하고 있습니다."
                title="도면을 변환하고 있습니다"
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

          <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            {downloadOptions.length > 0 ? (
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
          </div>

          {hasPreview && drawingNumberLabel ? (
            <div className="absolute bottom-2 left-2">
              <span className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-sm">
                {drawingNumberLabel}
              </span>
            </div>
          ) : null}

          {canOpenViewer ? (
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
          isProcessing && "border border-primary/20 bg-primary/5",
          !isProcessing &&
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
        {isProcessing ? (
          <DrawingProcessingState
            description="미리보기 산출물을 준비하고 있습니다."
            title="도면을 변환하고 있습니다"
          />
        ) : (
          <DrawingEmptyState isDragging={isDragging} />
        )}
      </button>
    </DrawingPreviewSection>
  );
}
