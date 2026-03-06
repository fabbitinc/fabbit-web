import { useDraggable } from "@dnd-kit/core";
import { AlertCircle, GitBranch, GripVertical, KeyRound, Puzzle, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@fabbit/ui";
import { cn } from "@/lib/utils";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import {
  COLUMN_TO_REL_TYPE,
  type KanbanCardData,
  type KanbanColumnId,
} from "@/features/part-template-mapping/types/template-mapping-kanban";
import { useKanbanContext } from "./kanban-context";

const EXTENDED_VALUE = "__extended__";
const UNSELECTED_VALUE = "__unselected__";

interface KanbanCardProps {
  card: KanbanCardData;
  columnId: KanbanColumnId;
}

export function KanbanCard({ card, columnId }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
    data: { card, columnId },
  });

  const context = useKanbanContext();
  const isUnmapped = columnId === "unmapped";
  const isPart = columnId === "Part";
  const isRelationColumn = !isUnmapped && !isPart;
  const isPartMergeKey =
    isPart &&
    !card.isExtended &&
    Boolean(card.targetProperty) &&
    (context.mergeKeysByLabel.Part || []).includes(card.targetProperty || "");
  const relationBadgeType = isRelationColumn ? getRelationBadgeType(card, columnId, context) : null;
  const issueMessage = getCardIssueMessage(card, columnId);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-14 items-center gap-2.5 rounded-2xl border border-border bg-background px-3 py-2 text-sm transition-all",
        "hover:border-primary/30 hover:shadow-sm",
        isDragging && "opacity-30",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
        aria-label="드래그"
      >
        <GripVertical className="size-3.5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-foreground">{card.sourceColumn}</div>
        {card.sampleData.length > 0 && (
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
            예시: {card.sampleData.join(", ")}
          </div>
        )}
      </div>

      {!isUnmapped && (
        <>
          {isPart ? (
            <PartSelect card={card} />
          ) : (
            <RelationSelect card={card} columnId={columnId} />
          )}

          <div className="flex shrink-0 items-center gap-1.5">
            {card.isExtended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--status-warning-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--status-warning)]">
                <Puzzle className="size-3" />
                확장
              </span>
            )}
            {isPartMergeKey && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                <KeyRound className="size-3" />
                매칭키
              </span>
            )}
            {isRelationColumn && relationBadgeType && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  relationBadgeType === "rel"
                    ? "bg-[var(--status-success-bg)] text-[var(--status-success)]"
                    : "bg-primary/10 text-primary",
                )}
              >
                {relationBadgeType === "rel" ? <GitBranch className="size-3" /> : <KeyRound className="size-3" />}
                {relationBadgeType === "rel" ? "관계속성" : "매칭키"}
              </span>
            )}
            {issueMessage && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center text-[var(--status-warning)]">
                    <AlertCircle className="size-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={8} className="text-xs">
                  {issueMessage}
                </TooltipContent>
              </Tooltip>
            )}
            <button
              type="button"
              className="rounded p-0.5 text-muted-foreground transition-colors hover:text-[var(--status-danger)]"
              aria-label="매핑 제거"
              onClick={() => handleRemove(card, columnId, context)}
            >
              <X className="size-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function PartSelect({ card }: { card: KanbanCardData }) {
  const context = useKanbanContext();
  const mappedProperties = new Set(
    context.columnMappings
      .filter(
        (mapping) =>
          !mapping.isExtended &&
          mapping.sourceColumn !== card.sourceColumn &&
          Boolean(mapping.targetProperty),
      )
      .map((mapping) => mapping.targetProperty),
  );
  const availableOptions = context.effectiveTargetOptions.filter(
    (option) => !mappedProperties.has(option.property),
  );
  const partMergeKeys = new Set(context.mergeKeysByLabel.Part || []);
  const selectValue = card.isExtended ? EXTENDED_VALUE : card.targetProperty || UNSELECTED_VALUE;

  return (
    <Select
      value={selectValue}
      onValueChange={(value) =>
        context.onSetPartMapping(card.sourceColumn, value === UNSELECTED_VALUE ? "" : value)
      }
    >
      <SelectTrigger className="h-8 w-[180px] shrink-0">
        <SelectValue placeholder="속성 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSELECTED_VALUE}>속성 선택</SelectItem>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>기본 속성</SelectLabel>
          {availableOptions.map((option) => (
            <SelectItem key={option.property} value={option.property}>
              <span className="inline-flex items-center gap-1">
                <span>{option.property}</span>
                {partMergeKeys.has(option.property) && <span className="text-[10px] text-[var(--status-danger)]">*</span>}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value={EXTENDED_VALUE}>확장 속성</SelectItem>
      </SelectContent>
    </Select>
  );
}

function RelationSelect({
  card,
  columnId,
}: {
  card: KanbanCardData;
  columnId: KanbanColumnId;
}) {
  const context = useKanbanContext();
  const relType = card.relType || COLUMN_TO_REL_TYPE[columnId] || "CONSISTS_OF";
  const targetInfo = context.relationTargetInfoByType[relType];
  const baseProperties = targetInfo?.targetProperties || targetInfo?.targetMergeKeys || [];
  const relationProperties = context.relationPropertyByType[relType] || [];
  const mergeKeys = targetInfo?.targetMergeKeys || [];

  const selectValue =
    card.relProperty !== undefined
      ? card.relProperty
        ? `rel:${card.relProperty}`
        : UNSELECTED_VALUE
      : card.relNodeProperty
        ? `node:${card.relNodeProperty}`
        : UNSELECTED_VALUE;

  const handleChange = (value: string) => {
    if (value === UNSELECTED_VALUE) {
      context.onSetRelationCardMapping(relType, card.sourceColumn, "rel", "");
      return;
    }

    const [mappingType, property] = value.split(":");
    if (!property) {
      return;
    }

    if (mappingType === "node" || mappingType === "rel") {
      context.onSetRelationCardMapping(relType, card.sourceColumn, mappingType, property);
    }
  };

  return (
    <Select value={selectValue} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-[180px] shrink-0">
        <SelectValue placeholder="속성 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSELECTED_VALUE}>속성 선택</SelectItem>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>기본 속성</SelectLabel>
          {baseProperties.map((property) => (
            <SelectItem key={`node:${property}`} value={`node:${property}`}>
              <span className="inline-flex items-center gap-1">
                <span>{property}</span>
                {mergeKeys.includes(property) && <span className="text-[10px] text-[var(--status-danger)]">*</span>}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>관계 속성</SelectLabel>
          {relationProperties.map((property) => (
            <SelectItem key={`rel:${property}`} value={`rel:${property}`}>
              {property}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function getCardIssueMessage(card: KanbanCardData, columnId: KanbanColumnId) {
  if (columnId === "unmapped") {
    return null;
  }

  if (columnId === "Part") {
    if (!card.isExtended && !card.targetProperty) {
      return "속성을 선택해주세요.";
    }

    return null;
  }

  if (card.relProperty !== undefined) {
    return card.relProperty ? null : "관계 속성을 선택해주세요.";
  }

  return card.relNodeProperty ? null : "기본 속성을 선택해주세요.";
}

function getRelationBadgeType(
  card: KanbanCardData,
  columnId: KanbanColumnId,
  context: ReturnType<typeof useKanbanContext>,
): "merge" | "rel" | null {
  if (card.relProperty !== undefined) {
    return card.relProperty ? "rel" : null;
  }

  const relType = card.relType || COLUMN_TO_REL_TYPE[columnId];
  if (!relType) {
    return null;
  }

  const mergeKeys = context.relationTargetInfoByType[relType]?.targetMergeKeys || [];
  const nodeProperty = card.relNodeProperty || "";
  if (!nodeProperty) {
    return null;
  }

  return mergeKeys.includes(nodeProperty) ? "merge" : null;
}

function handleRemove(
  card: KanbanCardData,
  columnId: KanbanColumnId,
  context: ReturnType<typeof useKanbanContext>,
) {
  if (columnId === "Part") {
    const existingMapping = context.columnMappings.find(
      (mapping) => mapping.sourceColumn === card.sourceColumn,
    );

    if (!existingMapping) {
      return;
    }

    if (!existingMapping.targetProperty || existingMapping.isExtended) {
      const state = usePartTemplateMappingStore.getState();
      state.setMappings(
        state.columnMappings.filter((mapping) => mapping.id !== existingMapping.id),
        state.relationMappings,
      );
      return;
    }

    context.onRemoveColumnMapping(existingMapping.id);
    return;
  }

  const relationMapping = context.relationMappings.find(
    (mapping) =>
      !mapping.dismissed &&
      (Object.values(mapping.nodeColumns).includes(card.sourceColumn) ||
        Object.keys(mapping.relColumns).includes(card.sourceColumn)),
  );

  if (relationMapping) {
    context.onRemoveRelationCardMapping(card.sourceColumn);
  }
}
