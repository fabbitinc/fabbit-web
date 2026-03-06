import { useCallback, useMemo, useState } from "react";
import {
  type DragEndEvent,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDndMonitor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ChevronDown, Table2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@fabbit/ui";
import { cn } from "@/lib/utils";
import { formatSampleCellValue } from "@/features/part-template-mapping/lib/template-mapping-utils";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import type { OntologySchemaModel } from "@/features/part-template-mapping/types/part-template-mapping-model";
import {
  COLUMN_TO_REL_TYPE,
  type KanbanCardData,
  type KanbanColumnId,
} from "@/features/part-template-mapping/types/template-mapping-kanban";
import {
  useTemplateMappingKanban,
} from "@/features/part-template-mapping/hooks/use-template-mapping-kanban";
import { removeExistingMapping } from "./kanban-utils";
import { KanbanColumn } from "./kanban-column";
import { KanbanDragOverlay } from "./kanban-drag-overlay";
import { KanbanProvider, type KanbanContextValue } from "./kanban-context";

const HEADER_COLOR_CLASS_MAP: Record<string, string> = {
  blue: "mapping-excel-header-part",
  indigo: "mapping-excel-header-parent-part",
  emerald: "mapping-excel-header-supplier",
  amber: "mapping-excel-header-drawing",
  violet: "mapping-excel-header-project",
  gray: "mapping-excel-header-unmapped",
};

interface KanbanBoardProps {
  ontologySchema?: OntologySchemaModel;
}

export function KanbanBoard({ ontologySchema }: KanbanBoardProps) {
  const kanban = useTemplateMappingKanban(ontologySchema);
  const mappingHeaders = usePartTemplateMappingStore((state) => state.mappingHeaders);
  const mappingSampleRows = usePartTemplateMappingStore((state) => state.mappingSampleRows);
  const [isSampleOpen, setIsSampleOpen] = useState(true);

  const contextValue = useMemo<KanbanContextValue>(
    () => ({
      effectiveTargetOptions: kanban.effectiveTargetOptions,
      columnMappings: kanban.columnMappings,
      relationMappings: kanban.relationMappings,
      onSetPartMapping: kanban.handleSetPartMapping,
      onSetRelationCardMapping: kanban.handleSetRelationCardMapping,
      onRemoveColumnMapping: kanban.handleRemoveColumnMapping,
      onRemoveExtendedMapping: kanban.handleRemoveExtendedMapping,
      onRemoveRelationMapping: kanban.handleRemoveRelationMapping,
      onRemoveRelationCardMapping: kanban.handleRemoveRelationCardMapping,
      relationPropertyByType: kanban.relationPropertyByType,
      relationTargetInfoByType: kanban.relationTargetInfoByType,
      mergeKeysByLabel: kanban.mergeKeysByLabel,
    }),
    [kanban],
  );

  const headerColorMap = useMemo(() => {
    const colorMap = new Map<string, string>();

    for (const column of kanban.columns) {
      for (const card of column.cards) {
        colorMap.set(card.sourceColumn, column.color);
      }
    }

    return colorMap;
  }, [kanban.columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 2 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        return;
      }

      const fromColumnId = (active.data.current as { columnId: KanbanColumnId } | undefined)?.columnId;
      const toColumnId = over.id as KanbanColumnId;

      if (!fromColumnId || fromColumnId === toColumnId) {
        return;
      }

      const sourceColumn = active.id as string;

      if (toColumnId === "unmapped") {
        removeExistingMapping(
          sourceColumn,
          fromColumnId,
          kanban.columnMappings,
          kanban.relationMappings,
          kanban.handleRemoveColumnMapping,
          kanban.handleRemoveExtendedMapping,
          kanban.handleRemoveRelationCardMapping,
        );
        return;
      }

      if (fromColumnId !== "unmapped") {
        removeExistingMapping(
          sourceColumn,
          fromColumnId,
          kanban.columnMappings,
          kanban.relationMappings,
          kanban.handleRemoveColumnMapping,
          kanban.handleRemoveExtendedMapping,
          kanban.handleRemoveRelationCardMapping,
        );
      }

      if (toColumnId === "Part") {
        kanban.handleSetPartMapping(sourceColumn, "");
        return;
      }

      const relType = COLUMN_TO_REL_TYPE[toColumnId];
      if (!relType) {
        return;
      }

      const existingRelation = kanban.relationMappings.find(
        (mapping) => !mapping.dismissed && mapping.relType === relType,
      );

      kanban.handleCreateRelationMapping(
        relType,
        existingRelation ? { ...existingRelation.nodeColumns } : {},
        { [sourceColumn]: "" },
        existingRelation ? { ...existingRelation.relColumnTypes } : {},
      );
    },
    [kanban],
  );

  return (
    <div className="space-y-4">
      {mappingHeaders.length > 0 && mappingSampleRows.length > 0 && (
        <Collapsible open={isSampleOpen} onOpenChange={setIsSampleOpen}>
          <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-[28px] border border-border bg-card px-5 py-4 text-left transition-colors hover:border-primary/30">
            <Table2 className="size-4 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium text-foreground">원본 데이터 미리보기</span>
            <span className="text-xs text-muted-foreground">
              {mappingSampleRows.length}행 x {mappingHeaders.length}열
            </span>
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isSampleOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 overflow-auto rounded-[28px] border border-border bg-card">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="mapping-excel-index-header sticky left-0 z-10 min-w-10 border-r border-border px-2 py-2 text-center font-semibold text-muted-foreground">
                      #
                    </th>
                    {mappingHeaders.map((header) => {
                      const colorClass = headerColorMap.get(header);
                      return (
                        <th
                          key={header}
                          className={cn(
                            "min-w-[120px] whitespace-nowrap border-r border-border px-3 py-2 text-left text-xs font-semibold",
                            colorClass ? HEADER_COLOR_CLASS_MAP[colorClass] : "text-foreground",
                          )}
                        >
                          {header}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {mappingSampleRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="mapping-excel-row-hover border-b border-border/60 last:border-b-0">
                      <td className="mapping-excel-index-header sticky left-0 z-10 border-r border-border px-2 py-1.5 text-center font-medium text-muted-foreground">
                        {rowIndex + 1}
                      </td>
                      {mappingHeaders.map((header) => (
                        <td key={header} className="whitespace-nowrap border-r border-border/40 px-3 py-1.5 text-muted-foreground">
                          {formatSampleCellValue(row[header])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <KanbanProvider value={contextValue}>
          <div className="flex flex-col gap-3">
            {kanban.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                issueCount={kanban.issueCountByColumn[column.id] || 0}
                issueSummary={kanban.issueSummaryByColumn[column.id] || ""}
              />
            ))}
          </div>
        </KanbanProvider>
        <KanbanDragLayer />
      </DndContext>
    </div>
  );
}

function KanbanDragLayer() {
  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);

  useDndMonitor({
    onDragStart(event) {
      const data = event.active.data.current as { card?: KanbanCardData } | undefined;
      setActiveCard(data?.card ?? null);
    },
    onDragEnd() {
      setActiveCard(null);
    },
    onDragCancel() {
      setActiveCard(null);
    },
  });

  return <DragOverlay dropAnimation={null}>{activeCard ? <KanbanDragOverlay card={activeCard} /> : null}</DragOverlay>;
}
