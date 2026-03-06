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
    { label: "품명", value: part.name ?? <span className="text-muted-foreground/40">—</span> },
    { label: "리비전", value: part.revision || <span className="text-muted-foreground/40">—</span> },
    {
      label: "상태",
      value: part.lifecycleState ? (
        <Badge variant={getLifecycleVariant(part.lifecycleState)}>{part.lifecycleState}</Badge>
      ) : (
        <span className="text-muted-foreground/40">—</span>
      ),
    },
    { label: "카테고리", value: part.category ?? <span className="text-muted-foreground/40">—</span> },
    { label: "재질", value: part.material ?? <span className="text-muted-foreground/40">—</span> },
    { label: "단위", value: part.unit ?? <span className="text-muted-foreground/40">—</span> },
    {
      label: "리드타임",
      value: part.leadTimeDays != null ? `${part.leadTimeDays}일` : <span className="text-muted-foreground/40">—</span>,
    },
    {
      label: "팬텀",
      value: part.isPhantom == null ? <span className="text-muted-foreground/40">—</span> : part.isPhantom ? "예" : "아니오",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <PartDrawingPreview
          part={{ drawing: part.drawing, partNumber: part.partNumber }}
          isDeleting={isDeletingDrawing}
          isUploading={isUploadingDrawing}
          onDelete={onDeleteDrawing}
          onUpload={onUploadDrawing}
        />
      </div>

      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-lg border">
          <table className="w-full">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border/40 last:border-b-0">
                  <td className="w-24 py-2.5 pl-4 pr-2 text-xs text-muted-foreground">{row.label}</td>
                  <td className="py-2.5 pr-4 text-sm text-foreground">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {part.description ? (
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">설명</h4>
            <p className="text-sm leading-relaxed text-foreground/80">{part.description}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
