import { useRef, useState } from "react";
import { Download, ExternalLink, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Button, ConfirmDialog } from "@fabbit/ui";

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

function downloadUrl(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.click();
}

export function PartDrawingPreview({
  part,
  isDeleting,
  isUploading,
  onDelete,
  onUpload,
}: PartDrawingPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const drawing = part.drawing;

  return (
    <>
      <div className="rounded-lg border bg-card p-4">
        <input
          ref={fileInputRef}
          accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.tif,.tiff"
          aria-label="부품 도면 업로드"
          className="hidden"
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUpload(file);
            }
            event.target.value = "";
          }}
        />

        {drawing ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border bg-muted/20">
              {drawing.thumbnailUrl ? (
                <img alt={drawing.name ?? drawing.drawingNumber ?? part.partNumber} className="aspect-[4/3] w-full object-cover" src={drawing.thumbnailUrl} />
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3">
                  {drawing.conversionStatus === "PENDING" ? (
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  ) : (
                    <FileText className="size-10 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {drawing.conversionStatus === "PENDING" ? "도면을 변환하는 중입니다." : "미리보기를 준비 중입니다."}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{drawing.drawingNumber ?? drawing.name ?? "등록된 도면"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {drawing.status ?? "상태 정보 없음"}
                  {drawing.version ? ` · v${drawing.version}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {drawing.pdfUrl ? (
                  <Button type="button" variant="outline" onClick={() => window.open(drawing.pdfUrl ?? "", "_blank", "noreferrer")}>
                    <ExternalLink className="size-4" />
                    PDF 보기
                  </Button>
                ) : null}
                {drawing.originalFileUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => downloadUrl(drawing.originalFileUrl ?? "", `${drawing.drawingNumber ?? part.partNumber}.drawing`)}
                  >
                    <Download className="size-4" />
                    원본 다운로드
                  </Button>
                ) : null}
                <Button disabled={isDeleting} type="button" variant="outline" onClick={() => setIsDeleteConfirmOpen(true)}>
                  <Trash2 className="size-4" />
                  삭제
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/70 bg-muted/20 transition-colors hover:border-primary/40 hover:bg-primary/5"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="size-8 animate-spin text-primary" /> : <Upload className="size-8 text-primary" />}
            <p className="mt-4 text-base font-medium text-foreground">{isUploading ? "업로드 중..." : "도면 등록"}</p>
            <p className="mt-2 text-sm text-muted-foreground">PDF, DWG, DXF, PNG, JPG 파일을 업로드할 수 있습니다.</p>
          </button>
        )}
      </div>

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        title="도면을 삭제할까요?"
        description={`${drawing?.drawingNumber ?? "등록된 도면"} 연결을 제거합니다.`}
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => onDelete()}
        onOpenChange={setIsDeleteConfirmOpen}
      />
    </>
  );
}
