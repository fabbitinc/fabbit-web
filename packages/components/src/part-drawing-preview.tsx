import { useRef, useState, type DragEvent } from "react";
import {
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
  thumbnailUrl: string | null;
  pdfUrl: string | null;
  originalFileUrl: string | null;
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
  onUpload: (file: File) => void;
}

const DRAWING_ACCEPT = [".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg", ".tif", ".tiff"];

function isAcceptedFile(file: File) {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  return DRAWING_ACCEPT.includes(ext);
}

export function PartDrawingPreview({
  part,
  isDeleting,
  isUploading,
  onDelete,
  onUpload,
}: PartDrawingPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const drawing = part.drawing;
  const hasDrawing = drawing != null;

  function openFilePicker() {
    if (isUploading) {
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

  function handleDelete() {
    if (isDeleting) {
      return;
    }

    if (!window.confirm("도면을 삭제하시겠습니까?")) {
      return;
    }

    onDelete();
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
    const hasThumbnail = !!previewDrawing.thumbnailUrl;
    const isConverting = previewDrawing.conversionStatus === "PENDING";
    const isFailed = previewDrawing.conversionStatus === "FAILED";
    const downloadOptions = [
      { label: "원본 다운로드", icon: Download, url: previewDrawing.originalFileUrl },
      { label: "PDF 다운로드", icon: FileDown, url: previewDrawing.pdfUrl },
      { label: "이미지 다운로드", icon: ImageDown, url: previewDrawing.thumbnailUrl },
    ].filter((option) => option.url != null);

    return (
      <>
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
            "group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-muted/20",
            isFailed && "cursor-pointer border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30",
            isFailed && isDragging && "border-primary bg-primary/5",
          )}
          onDragLeave={isFailed ? handleDragLeave : undefined}
          onDragOver={isFailed ? handleDragOver : undefined}
          onDrop={isFailed ? handleDrop : undefined}
        >
          <div
            className={cn("flex h-full w-full items-center justify-center", (isFailed || previewDrawing.pdfUrl) && "cursor-pointer")}
            onClick={isFailed ? openFilePicker : previewDrawing.pdfUrl ? () => window.open(previewDrawing.pdfUrl ?? "", "_blank", "noopener,noreferrer") : undefined}
          >
            {hasThumbnail ? (
              <img
                alt={previewDrawing.name ?? previewDrawing.drawingNumber ?? part.partNumber}
                className="h-full w-full object-contain"
                src={previewDrawing.thumbnailUrl ?? ""}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                <div className="relative">
                  {isConverting ? (
                    <>
                      <Loader2 className="h-14 w-14 animate-spin" strokeWidth={1} />
                      <span className="mt-1 text-[10px]">변환 중...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-14 w-14" strokeWidth={1} />
                      <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Layers className="h-3 w-3" />
                      </div>
                    </>
                  )}
                </div>
                {isFailed ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-center text-[11px] text-destructive">
                      도면 변환에 실패했습니다. 파일을 다시 업로드해 주세요.
                    </span>
                    <span className="text-[10px] text-muted-foreground/80">
                      파일을 드래그하거나 클릭해서 다시 업로드
                    </span>
                    <Button
                      className="h-7 px-2.5 text-[11px]"
                      disabled={isUploading}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        openFilePicker();
                      }}
                    >
                      다시 업로드
                    </Button>
                  </div>
                ) : (
                  !isConverting ? <span className="text-[10px]">도면 미리보기</span> : null
                )}
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
                    <DropdownMenuItem key={option.label} onClick={() => handleDownload(option.url ?? "")}>
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

          <div className="absolute bottom-2 left-2">
            <span className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-sm">
              {previewDrawing.drawingNumber}
            </span>
          </div>

          {previewDrawing.pdfUrl ? (
            <div className="absolute bottom-2 right-2">
              <span className="flex h-6 items-center gap-1 rounded bg-background/80 px-2 text-muted-foreground shadow-sm">
                <ExternalLink className="h-3 w-3" />
                <span className="text-[10px]">PDF 보기</span>
              </span>
            </div>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
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
          "group flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/15 bg-muted/10 hover:border-primary/40 hover:bg-muted/20",
        )}
        type="button"
        onClick={openFilePicker}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <>
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary/60" />
            <p className="text-sm font-medium text-primary/70">업로드 중...</p>
            <p className="mt-1 text-[11px] text-primary/40">도면을 등록하고 있습니다</p>
          </>
        ) : (
          <>
            <div
              className={cn(
                "mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                isDragging
                  ? "border-primary/40 bg-primary/10"
                  : "border-2 border-dashed border-muted-foreground/15 group-hover:border-primary/30 group-hover:bg-primary/5",
              )}
            >
              <Upload
                className={cn(
                  "h-5 w-5 transition-colors",
                  isDragging
                    ? "text-primary"
                    : "text-muted-foreground/25 group-hover:text-primary/50",
                )}
              />
            </div>
            <p
              className={cn(
                "text-sm font-medium transition-colors",
                isDragging
                  ? "text-primary"
                  : "text-muted-foreground/35 group-hover:text-foreground/60",
              )}
            >
              {isDragging ? "여기에 놓으세요" : "도면 등록"}
            </p>
            <p
              className={cn(
                "mt-1 text-[11px] transition-colors",
                isDragging
                  ? "text-primary/60"
                  : "text-muted-foreground/20 group-hover:text-muted-foreground/40",
              )}
            >
              파일을 드래그하거나 클릭하여 업로드 · PDF, DWG, DXF
            </p>
          </>
        )}
      </button>
    </>
  );
}
