import type { ReactNode } from "react";
import { Badge } from "@fabbit/ui";
import { PartDrawingPreview, type PartDrawingPreviewDrawing } from "./part-drawing-preview";

export interface PartPropertiesTabPart {
  partNumber: string;
  name: string | null;
  revision: string;
  lifecycleState: string | null;
  category: string | null;
  material: string | null;
  unit: string | null;
  leadTimeDays: number | null;
  isPhantom: boolean | null;
  description: string | null;
  drawing: PartDrawingPreviewDrawing | null;
}

export interface PartPropertiesTabProps {
  isDeletingDrawing: boolean;
  isUploadingDrawing: boolean;
  part: PartPropertiesTabPart;
  onDeleteDrawing: () => void;
  onUploadDrawing: (file: File) => void;
}

function getLifecycleVariant(lifecycleState: string | null): "outline" | "neutral" | "accent" | "success" {
  if (lifecycleState === "양산") {
    return "success";
  }

  if (lifecycleState === "중단") {
    return "neutral";
  }

  return "outline";
}

export function PartPropertiesTab({
  isDeletingDrawing,
  isUploadingDrawing,
  part,
  onDeleteDrawing,
  onUploadDrawing,
}: PartPropertiesTabProps) {
  const rows: { label: string; value: ReactNode }[] = [
    { label: "품번", value: <span className="font-mono text-xs">{part.partNumber}</span> },
    { label: "품명", value: part.name ?? "이름 없음" },
    { label: "리비전", value: part.revision },
    {
      label: "상태",
      value: part.lifecycleState ? <Badge variant={getLifecycleVariant(part.lifecycleState)}>{part.lifecycleState}</Badge> : "미지정",
    },
    { label: "카테고리", value: part.category ?? "미분류" },
    { label: "재질", value: part.material ?? "미지정" },
    { label: "단위", value: part.unit ?? "미지정" },
    { label: "리드타임", value: part.leadTimeDays != null ? `${part.leadTimeDays}일` : "미지정" },
    { label: "팬텀", value: part.isPhantom == null ? "미지정" : part.isPhantom ? "예" : "아니오" },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <PartDrawingPreview
        part={{ drawing: part.drawing, partNumber: part.partNumber }}
        isDeleting={isDeletingDrawing}
        isUploading={isUploadingDrawing}
        onDelete={onDeleteDrawing}
        onUpload={onUploadDrawing}
      />

      <div className="space-y-4">
        <section className="app-panel rounded-[28px] p-4">
          <p className="text-lg font-semibold text-foreground">속성</p>
          <div className="mt-4 overflow-hidden rounded-[20px] border border-border/70">
            <table className="w-full text-sm">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border/60 last:border-b-0">
                    <td className="w-28 bg-muted/20 px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {part.description ? (
          <section className="app-panel rounded-[28px] p-4">
            <p className="text-lg font-semibold text-foreground">설명</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{part.description}</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
