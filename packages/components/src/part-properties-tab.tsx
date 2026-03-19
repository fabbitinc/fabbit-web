import {
  PartDrawingPreview,
  type PartDrawingPreviewActivityState,
  type PartDrawingPreviewDrawing,
  type PartDrawingPreviewProps,
} from "./part-drawing-preview";
import { PartPropertiesTable } from "./part-properties-table";
import type { PartPropertiesTableRow } from "./part-properties-table";

export interface PartPropertiesTabPart {
  partNumber: string;
  drawing: PartDrawingPreviewDrawing | null;
}

export interface PartPropertiesTabProps {
  drawingActivityState: PartDrawingPreviewActivityState;
  extendedRows?: PartPropertiesTableRow[];
  part: PartPropertiesTabPart;
  rows: PartPropertiesTableRow[];
  onOpenDrawingViewer?: (drawing: PartDrawingPreviewDrawing) => void;
  previewSettings?: PartDrawingPreviewProps["previewSettings"];
}

export function PartPropertiesTab({
  drawingActivityState,
  extendedRows,
  part,
  rows,
  onOpenDrawingViewer,
  previewSettings,
}: PartPropertiesTabProps) {
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
        <PartPropertiesTable rows={rows} />
        {extendedRows && extendedRows.length > 0 ? (
          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">사용자 정의 항목</h3>
              <p className="text-xs text-muted-foreground">조직에서 추가로 정의한 부품 항목입니다.</p>
            </div>
            <PartPropertiesTable rows={extendedRows} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
