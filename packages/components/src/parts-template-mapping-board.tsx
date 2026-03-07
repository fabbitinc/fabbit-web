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
  cn,
} from "@fabbit/ui";
import {
  PartsTemplateMappingBoardProvider,
  type PartsTemplateMappingBoardContextValue,
} from "./parts-template-mapping/kanban-context";
import { PartsTemplateMappingColumn } from "./parts-template-mapping/kanban-column";
import { PartsTemplateMappingDragOverlay } from "./parts-template-mapping/kanban-drag-overlay";
import {
  formatSampleCellValue,
  type PartsTemplateMappingBoardCard,
  type PartsTemplateMappingBoardColumnId,
  type PartsTemplateMappingBoardProps,
} from "./parts-template-mapping/types";

export type {
  PartsTemplateMappingBoardCard,
  PartsTemplateMappingBoardColumn,
  PartsTemplateMappingBoardColumnId,
  PartsTemplateMappingBoardColumnMapping,
  PartsTemplateMappingBoardProps,
  PartsTemplateMappingBoardRelationMapping,
  PartsTemplateMappingBoardRelationTargetInfo,
  PartsTemplateMappingBoardTargetPropertyOption,
} from "./parts-template-mapping/types";

const HEADER_COLOR_CLASS_MAP: Record<string, string> = {
  blue: "mapping-excel-header-part",
  indigo: "mapping-excel-header-parent-part",
  emerald: "mapping-excel-header-supplier",
  amber: "mapping-excel-header-drawing",
  violet: "mapping-excel-header-project",
  gray: "mapping-excel-header-unmapped",
};

export function PartsTemplateMappingBoard({
  columns,
  mappingHeaders,
  mappingSampleRows,
  effectiveTargetOptions,
  columnMappings,
  propertyLabelByName = {},
  relationMappings,
  relationPropertyByType,
  relationTargetInfoByType,
  mergeKeysByLabel,
  issueCountByColumn = {},
  issueSummaryByColumn = {},
  onMoveCard,
  onSetPartMapping,
  onSetRelationCardMapping,
  onRemoveColumnMapping,
  onRemoveExtendedMapping,
  onRemoveRelationCardMapping,
}: PartsTemplateMappingBoardProps) {
  const [sampleOpen, setSampleOpen] = useState(true);

  const contextValue = useMemo<PartsTemplateMappingBoardContextValue>(
    () => ({
      effectiveTargetOptions,
      columnMappings,
      propertyLabelByName,
      relationMappings,
      relationPropertyByType,
      relationTargetInfoByType,
      mergeKeysByLabel,
      onSetPartMapping,
      onSetRelationCardMapping,
      onRemoveColumnMapping,
      onRemoveExtendedMapping,
      onRemoveRelationCardMapping,
    }),
    [
      effectiveTargetOptions,
      columnMappings,
      propertyLabelByName,
      relationMappings,
      relationPropertyByType,
      relationTargetInfoByType,
      mergeKeysByLabel,
      onSetPartMapping,
      onSetRelationCardMapping,
      onRemoveColumnMapping,
      onRemoveExtendedMapping,
      onRemoveRelationCardMapping,
    ],
  );

  const headerColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const column of columns) {
      for (const card of column.cards) {
        map.set(card.sourceColumn, column.color);
      }
    }
    return map;
  }, [columns]);

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

      const fromColumnId = (active.data.current as { columnId: PartsTemplateMappingBoardColumnId } | undefined)?.columnId;
      const toColumnId = over.id as PartsTemplateMappingBoardColumnId;

      if (!fromColumnId || fromColumnId === toColumnId) {
        return;
      }

      const sourceColumn = active.id as string;
      onMoveCard(sourceColumn, fromColumnId, toColumnId);
    },
    [onMoveCard],
  );

  return (
    <div className="space-y-4">
      {mappingHeaders.length > 0 && mappingSampleRows.length > 0 ? (
        <Collapsible open={sampleOpen} onOpenChange={setSampleOpen}>
          <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left transition-colors hover:bg-gray-50">
            <Table2 className="size-4 text-gray-500" />
            <span className="flex-1 text-sm font-medium text-gray-700">
              원본 데이터 미리보기
            </span>
            <span className="text-xs text-gray-400">
              {mappingSampleRows.length}행 x {mappingHeaders.length}열
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-gray-400 transition-transform",
                sampleOpen && "rotate-180",
              )}
            />
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
                      const headerColorClass = color
                        ? HEADER_COLOR_CLASS_MAP[color]
                        : undefined;

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
                  {mappingSampleRows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="mapping-excel-row-hover border-b border-gray-100 last:border-b-0"
                    >
                      <td className="mapping-excel-index-header sticky left-0 z-10 border-r border-gray-200 bg-gray-50 px-2 py-1.5 text-center font-medium text-gray-400">
                        {rowIndex + 1}
                      </td>
                      {mappingHeaders.map((header) => (
                        <td
                          key={header}
                          className="whitespace-nowrap border-r border-gray-50 px-3 py-1.5 text-gray-600"
                        >
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
      ) : null}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <PartsTemplateMappingBoardProvider value={contextValue}>
          <div className="flex flex-col gap-3">
            {columns.map((column) => (
              <PartsTemplateMappingColumn
                key={column.id}
                column={column}
                issueCount={issueCountByColumn[column.id] || 0}
                issueSummary={issueSummaryByColumn[column.id] || ""}
              />
            ))}
          </div>
        </PartsTemplateMappingBoardProvider>
        <PartsTemplateMappingDragLayer propertyLabelByName={propertyLabelByName} />
      </DndContext>
    </div>
  );
}

function PartsTemplateMappingDragLayer({
  propertyLabelByName,
}: {
  propertyLabelByName: Record<string, string>;
}) {
  const [activeCard, setActiveCard] = useState<PartsTemplateMappingBoardCard | null>(null);

  useDndMonitor({
    onDragStart(event) {
      const data = event.active.data.current as { card?: PartsTemplateMappingBoardCard } | undefined;
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
      {activeCard ? (
        <PartsTemplateMappingDragOverlay
          card={activeCard}
          propertyLabelByName={propertyLabelByName}
        />
      ) : null}
    </DragOverlay>
  );
}
