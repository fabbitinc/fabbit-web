import type { ReactNode } from "react";
import { Badge } from "@fabbit/ui";
import {
  PartDrawingPreview,
  type PartDrawingPreviewActivityState,
  type PartDrawingPreviewDrawing,
  type PartDrawingPreviewProps,
} from "./part-drawing-preview";
import { PartPropertiesTable } from "./part-properties-table";

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
  drawingActivityState: PartDrawingPreviewActivityState;
  part: PartPropertiesTabPart;
  onOpenDrawingViewer?: (drawing: PartDrawingPreviewDrawing) => void;
  previewSettings?: PartDrawingPreviewProps["previewSettings"];
}

function getLifecycleVariant(lifecycleState: string | null): "outline" | "neutral" | "accent" | "success" {
  if (lifecycleState === "ACTIVE") {
    return "success";
  }

  if (lifecycleState === "EOL") {
    return "accent";
  }

  if (lifecycleState === "OBSOLETE") {
    return "neutral";
  }

  return "outline";
}

function getLifecycleBadgeClassName(lifecycleState: string | null) {
  if (lifecycleState === "ACTIVE") {
    return "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success)]";
  }

  if (lifecycleState === "EOL") {
    return "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning)]";
  }

  if (lifecycleState === "OBSOLETE") {
    return "border-[var(--status-neutral-border)] bg-[var(--status-neutral-bg)] text-muted-foreground";
  }

  return undefined;
}

export function PartPropertiesTab({
  drawingActivityState,
  part,
  onOpenDrawingViewer,
  previewSettings,
}: PartPropertiesTabProps) {
  const rows: { label: string; value: ReactNode }[] = [
    { label: "품번", value: <span className="font-mono text-xs">{part.partNumber}</span> },
    { label: "품명", value: part.name ?? <span className="text-muted-foreground/40">—</span> },
    { label: "리비전", value: part.revision || <span className="text-muted-foreground/40">—</span> },
    {
      label: "상태",
      value: part.lifecycleState ? (
        <Badge className={getLifecycleBadgeClassName(part.lifecycleState)} variant={getLifecycleVariant(part.lifecycleState)}>
          {part.lifecycleState}
        </Badge>
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
    {
      label: "설명",
      value: part.description ? (
        <p className="whitespace-pre-wrap leading-6 text-foreground/80">{part.description}</p>
      ) : (
        <span className="text-muted-foreground/40">—</span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <PartDrawingPreview
          activityState={drawingActivityState}
          part={{ drawing: part.drawing, partNumber: part.partNumber }}
          onOpenViewer={onOpenDrawingViewer}
          previewSettings={previewSettings}
        />
      </div>

      <div className="space-y-4 lg:col-span-2">
        <PartPropertiesTable
          rows={rows.map((row) => ({
            ...row,
            alignTop: row.label === "설명",
          }))}
        />
      </div>
    </div>
  );
}
