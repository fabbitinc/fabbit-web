import { useDraggable } from "@dnd-kit/core";
import {
  AlertCircle,
  GitBranch,
  GripVertical,
  KeyRound,
  Puzzle,
  X,
} from "lucide-react";
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
  cn,
} from "@fabbit/ui";
import { usePartsTemplateMappingBoardContext } from "./kanban-context";
import {
  COLUMN_TO_REL_TYPE,
  EXTENDED_VALUE,
  UNSELECTED_VALUE,
  getPropertyDisplayName,
  type PartsTemplateMappingBoardCard,
  type PartsTemplateMappingBoardColumnId,
} from "./types";

interface PartsTemplateMappingCardProps {
  card: PartsTemplateMappingBoardCard;
  columnId: PartsTemplateMappingBoardColumnId;
}

export function PartsTemplateMappingCard({
  card,
  columnId,
}: PartsTemplateMappingCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
    data: { card, columnId },
  });

  const context = usePartsTemplateMappingBoardContext();
  const isUnmapped = columnId === "unmapped";
  const isPart = columnId === "Part";
  const isRelationColumn = !isUnmapped && !isPart;
  const isPartMergeKey =
    isPart &&
    !card.isExtended &&
    Boolean(card.targetProperty) &&
    (context.mergeKeysByLabel.Part || []).includes(card.targetProperty || "");
  const relationBadgeType = isRelationColumn
    ? getRelationBadgeType(card, columnId, context)
    : null;
  const issueMessage = getCardIssueMessage(card, columnId);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-12 w-full items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 text-sm transition-all",
        "hover:border-gray-300 hover:shadow-sm",
        isDragging && "opacity-30",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="드래그"
        className="shrink-0 cursor-grab rounded p-0.5 text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        type="button"
      >
        <GripVertical className="size-3.5" />
      </button>

      <span className="w-[120px] shrink-0 truncate font-medium text-gray-800">
        {card.sourceColumn}
      </span>

      {!isUnmapped ? (
        <>
          <span className="shrink-0 text-gray-300">→</span>
          {isPart ? (
            <PartSelect card={card} />
          ) : (
            <RelationSelect card={card} columnId={columnId} />
          )}
        </>
      ) : null}

      {!isUnmapped ? (
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {card.isExtended ? (
            <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
              <Puzzle className="size-3" />
              확장
            </span>
          ) : null}
          {isPartMergeKey ? (
            <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
              <KeyRound className="size-3" />
              매칭키
            </span>
          ) : null}
          {isRelationColumn && relationBadgeType ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium",
                relationBadgeType === "rel"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-blue-50 text-blue-600",
              )}
            >
              {relationBadgeType === "rel" ? (
                <GitBranch className="size-3" />
              ) : (
                <KeyRound className="size-3" />
              )}
              {relationBadgeType === "rel" ? "관계속성" : "매칭키"}
            </span>
          ) : null}
          {issueMessage ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center text-amber-500">
                  <AlertCircle className="size-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={8}
                hideArrow
                className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white"
              >
                {issueMessage}
              </TooltipContent>
            </Tooltip>
          ) : null}
          <button
            aria-label="매핑 제거"
            className="rounded p-0.5 text-gray-300 transition-colors hover:text-red-400"
            onClick={() => handleRemove(card, columnId, context)}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getCardIssueMessage(
  card: PartsTemplateMappingBoardCard,
  columnId: PartsTemplateMappingBoardColumnId,
) {
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
    return card.relProperty ? null : "속성을 선택해주세요.";
  }

  if (!card.relNodeProperty) {
    return "기본 속성을 선택해주세요.";
  }

  return null;
}

function getRelationBadgeType(
  card: PartsTemplateMappingBoardCard,
  columnId: PartsTemplateMappingBoardColumnId,
  context: ReturnType<typeof usePartsTemplateMappingBoardContext>,
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

function RelationSelect({
  card,
  columnId,
}: {
  card: PartsTemplateMappingBoardCard;
  columnId: PartsTemplateMappingBoardColumnId;
}) {
  const context = usePartsTemplateMappingBoardContext();
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
      <SelectTrigger className="h-7 w-[160px] shrink-0 border-gray-200 px-2 text-xs">
        <SelectValue placeholder="선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem className="text-xs text-gray-500" value={UNSELECTED_VALUE}>
          속성 선택
        </SelectItem>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel className="px-2 py-1 text-[10px] font-semibold text-gray-500">
            기본 속성
          </SelectLabel>
          {baseProperties.map((property) => (
            <SelectItemWithTooltip
              key={`node:${property}`}
              display={getPropertyDisplayName(context.propertyLabelByName, property)}
              original={property}
              required={mergeKeys.includes(property)}
              value={`node:${property}`}
            />
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel className="px-2 py-1 text-[10px] font-semibold text-gray-500">
            관계 속성
          </SelectLabel>
          {relationProperties.map((property) => (
            <SelectItemWithTooltip
              key={`rel:${property}`}
              display={getPropertyDisplayName(context.propertyLabelByName, property)}
              original={property}
              value={`rel:${property}`}
            />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function PartSelect({ card }: { card: PartsTemplateMappingBoardCard }) {
  const context = usePartsTemplateMappingBoardContext();
  const mappedProperties = new Set(
    context.columnMappings
      .filter(
        (mapping) =>
          !mapping.isExtended &&
          mapping.sourceColumn !== card.sourceColumn &&
          mapping.targetProperty,
      )
      .map((mapping) => mapping.targetProperty),
  );

  const availableOptions = context.effectiveTargetOptions.filter(
    (option) => !mappedProperties.has(option.property),
  );
  const partMergeKeys = new Set(context.mergeKeysByLabel.Part || []);

  const selectValue = card.isExtended
    ? EXTENDED_VALUE
    : card.targetProperty || UNSELECTED_VALUE;

  return (
    <Select
      value={selectValue}
      onValueChange={(value) =>
        context.onSetPartMapping(
          card.sourceColumn,
          value === UNSELECTED_VALUE ? "" : value,
        )
      }
    >
      <SelectTrigger className="h-7 w-[160px] shrink-0 border-gray-200 px-2 text-xs">
        <SelectValue placeholder="선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem className="text-xs text-gray-500" value={UNSELECTED_VALUE}>
          속성 선택
        </SelectItem>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel className="px-2 py-1 text-[10px] font-semibold text-gray-500">
            기본 속성
          </SelectLabel>
          {availableOptions.map((option) => (
            <SelectItemWithTooltip
              key={option.property}
              display={getPropertyDisplayName(context.propertyLabelByName, option.property)}
              original={option.property}
              required={partMergeKeys.has(option.property)}
              value={option.property}
            />
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectItem className="text-xs text-amber-600" value={EXTENDED_VALUE}>
          확장 속성
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function SelectItemWithTooltip({
  value,
  display,
  original,
  required = false,
}: {
  value: string;
  display: string;
  original: string;
  required?: boolean;
}) {
  const content = (
    <span className="inline-flex w-full items-center gap-1">
      <span className="truncate">{display}</span>
      {required ? (
        <span aria-label="필수" className="text-[10px] font-semibold text-red-500">
          *
        </span>
      ) : null}
    </span>
  );

  if (display === original) {
    return (
      <SelectItem className="text-xs" value={value}>
        {content}
      </SelectItem>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SelectItem className="text-xs" value={value}>
          {content}
        </SelectItem>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        hideArrow
        className="rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white"
      >
        {original}
      </TooltipContent>
    </Tooltip>
  );
}

function handleRemove(
  card: PartsTemplateMappingBoardCard,
  columnId: PartsTemplateMappingBoardColumnId,
  context: ReturnType<typeof usePartsTemplateMappingBoardContext>,
) {
  if (columnId === "Part") {
    const existing = context.columnMappings.find(
      (mapping) => mapping.sourceColumn === card.sourceColumn,
    );
    if (!existing) {
      return;
    }

    if (!existing.targetProperty || existing.isExtended) {
      if (existing.isExtended) {
        context.onRemoveExtendedMapping(existing.id);
      } else {
        void context.onRemoveColumnMapping(existing.id);
      }
    } else {
      void context.onRemoveColumnMapping(existing.id);
    }

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
