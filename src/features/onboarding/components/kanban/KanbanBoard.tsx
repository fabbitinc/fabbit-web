import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDndMonitor,
  type DragEndEvent,
} from "@dnd-kit/core";
import { ChevronDown, Table2 } from "lucide-react";
import { useMappingStore } from "@/stores/onboarding";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanDragOverlay } from "./KanbanDragOverlay";
import { KanbanProvider, type KanbanContextValue } from "./KanbanContext";
import { removeExistingMapping } from "./kanbanUtils";
import { useMappingKanban } from "@/features/onboarding/hooks/useMappingKanban";
import type { KanbanCardData, KanbanColumnId } from "@/features/onboarding/hooks/useMappingKanban";
import { COLUMN_TO_REL_TYPE } from "@/features/onboarding/hooks/useMappingKanban";

const HEADER_COLOR_CLASS_MAP: Record<string, string> = {
  blue: "mapping-excel-header-part",
  indigo: "mapping-excel-header-parent-part",
  emerald: "mapping-excel-header-supplier",
  amber: "mapping-excel-header-drawing",
  violet: "mapping-excel-header-project",
  gray: "mapping-excel-header-unmapped",
};

export function KanbanBoard() {
  const kanban = useMappingKanban();
  const columnMappings = useMappingStore((s) => s.columnMappings);
  const relationMappings = useMappingStore((s) => s.relationMappings);
  const mappingHeaders = useMappingStore((s) => s.mappingHeaders);
  const mappingSampleRows = useMappingStore((s) => s.mappingSampleRows);

  const [sampleOpen, setSampleOpen] = useState(true);

  // Context value
  const kanbanContextValue = useMemo<KanbanContextValue>(
    () => ({
      effectiveTargetOptions: kanban.effectiveTargetOptions,
      columnMappings,
      onSetPartMapping: kanban.handleSetPartMapping,
      onSetRelationCardMapping: kanban.handleSetRelationCardMapping,
      onRemoveColumnMapping: kanban.handleRemoveColumnMapping,
      onRemoveExtendedMapping: kanban.handleRemoveExtendedMapping,
      onRemoveRelationMapping: kanban.handleRemoveRelationMapping,
      onRemoveRelationCardMapping: kanban.handleRemoveRelationCardMapping,
      relationMappings,
      relationPropertyByType: kanban.relationPropertyByType,
      relationTargetInfoByType: kanban.relationTargetInfoByType,
      mergeKeysByLabel: kanban.mergeKeysByLabel,
    }),
    [kanban, columnMappings, relationMappings],
  );

  // 헤더 → 칸반 컬럼 색상 매핑
  const headerColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const col of kanban.columns) {
      for (const card of col.cards) {
        map.set(card.sourceColumn, col.color);
      }
    }
    return map;
  }, [kanban.columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 2 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const fromColumnId = (active.data.current as { columnId: KanbanColumnId })?.columnId;
      const toColumnId = over.id as KanbanColumnId;

      if (!fromColumnId || fromColumnId === toColumnId) return;

      const sourceColumn = active.id as string;

      // unmapped로 드롭: 기존 매핑 바로 제거
      if (toColumnId === "unmapped") {
        removeExistingMapping(
          sourceColumn,
          fromColumnId,
          columnMappings,
          relationMappings,
          kanban.handleRemoveColumnMapping,
          kanban.handleRemoveExtendedMapping,
          kanban.handleRemoveRelationCardMapping,
        );
        return;
      }

      // 기존 매핑 먼저 제거
      if (fromColumnId !== "unmapped") {
        removeExistingMapping(
          sourceColumn,
          fromColumnId,
          columnMappings,
          relationMappings,
          kanban.handleRemoveColumnMapping,
          kanban.handleRemoveExtendedMapping,
          kanban.handleRemoveRelationCardMapping,
        );
      }

      // Part 컬럼: 즉시 이동 ("선택" 상태)
      if (toColumnId === "Part") {
        kanban.handleSetPartMapping(sourceColumn, "");
        return;
      }

      // 관계 컬럼: 즉시 이동 (첫 번째 merge key로 기본 배치)
      const relType = COLUMN_TO_REL_TYPE[toColumnId];
      if (relType) {
        const existingRelation = relationMappings.find(
          (rm) => !rm.dismissed && rm.rel_type === relType,
        );
        kanban.handleCreateRelationMapping(
          relType,
          existingRelation ? { ...existingRelation.node_columns } : {},
          { [sourceColumn]: "" },
          existingRelation ? { ...existingRelation.rel_column_types } : {},
        );
      }
    },
    [columnMappings, relationMappings, kanban],
  );

  return (
    <div className="space-y-4">
      {/* 샘플 데이터 미리보기 */}
      {mappingHeaders.length > 0 && mappingSampleRows.length > 0 && (
        <Collapsible open={sampleOpen} onOpenChange={setSampleOpen}>
          <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left transition-colors hover:bg-gray-50">
              <Table2 className="size-4 text-gray-500" />
              <span className="flex-1 text-sm font-medium text-gray-700">
                원본 데이터 미리보기
              </span>
              <span className="text-xs text-gray-400">
                {mappingSampleRows.length}행 x {mappingHeaders.length}열
              </span>
              <ChevronDown className={cn(
                "size-4 text-gray-400 transition-transform",
                sampleOpen && "rotate-180",
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 overflow-auto rounded-lg border border-gray-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="mapping-excel-index-header sticky left-0 z-10 min-w-10 border-r border-gray-200 bg-gray-100 px-2 py-2 text-center font-semibold text-gray-500">
                        #
                      </th>
                      {mappingHeaders.map((header) => {
                        const color = headerColorMap.get(header);
                        const headerColorClass = color ? HEADER_COLOR_CLASS_MAP[color] : undefined;
                        return (
                          <th
                            key={header}
                            className={cn(
                              "min-w-[120px] whitespace-nowrap border-r border-gray-100 px-3 py-2 text-left text-xs font-semibold",
                              headerColorClass,
                              !color && "text-gray-700",
                            )}
                          >
                            {header}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {mappingSampleRows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="mapping-excel-row-hover border-b border-gray-100 last:border-b-0"
                      >
                        <td className="mapping-excel-index-header sticky left-0 z-10 border-r border-gray-200 bg-gray-50 px-2 py-1.5 text-center font-medium text-gray-400">
                          {rowIdx + 1}
                        </td>
                        {mappingHeaders.map((header) => (
                          <td
                            key={header}
                            className="whitespace-nowrap border-r border-gray-50 px-3 py-1.5 text-gray-600"
                          >
                            {row[header] ?? ""}
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

      {/* 칸반 보드 */}
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <KanbanProvider value={kanbanContextValue}>
          <div className="flex flex-col gap-3">
            {kanban.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                mappingHeaders={mappingHeaders}
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
      const data = event.active.data.current as { card: KanbanCardData } | undefined;
      setActiveCard(data?.card || null);
    },
    onDragEnd() {
      setActiveCard(null);
    },
    onDragCancel() {
      setActiveCard(null);
    },
  });

  return (
    <DragOverlay dropAnimation={null}>
      {activeCard && <KanbanDragOverlay card={activeCard} />}
    </DragOverlay>
  );
}
