import { useDraggable } from "@dnd-kit/core";
import { GripVertical, X, Puzzle, KeyRound, GitBranch, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useMappingStore } from "@/stores/onboarding";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useKanbanContext } from "./KanbanContext";
import {
  COLUMN_TO_REL_TYPE,
  type KanbanCardData,
  type KanbanColumnId,
} from "@/features/onboarding/hooks/useMappingKanban";

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

  const ctx = useKanbanContext();
  const isUnmapped = columnId === "unmapped";
  const isPart = columnId === "Part";
  const isRelationColumn = !isUnmapped && !isPart;
  const isPartMergeKey =
    isPart &&
    !card.isExtended &&
    Boolean(card.targetProperty) &&
    (ctx.mergeKeysByLabel.Part || []).includes(card.targetProperty || "");
  const relationBadgeType = isRelationColumn
    ? getRelationBadgeType(card, columnId, ctx)
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
      {/* 드래그 핸들 */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab rounded p-0.5 text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        aria-label="드래그"
      >
        <GripVertical className="size-3.5" />
      </button>

      {/* 원본 컬럼명 */}
      <span className="w-[120px] shrink-0 truncate font-medium text-gray-800">
        {card.sourceColumn}
      </span>

      {/* 인라인 속성 (미할당 제외) */}
      {!isUnmapped && (
        <>
          <span className="shrink-0 text-gray-300">→</span>
          {isPart ? (
            <PartSelect card={card} ctx={ctx} />
          ) : (
            <RelationSelect card={card} columnId={columnId} ctx={ctx} />
          )}
        </>
      )}

      {/* 오른쪽 영역: 확장 뱃지 + 제거 버튼 */}
      {!isUnmapped && (
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {card.isExtended && (
            <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
              <Puzzle className="size-3" />
              확장
            </span>
          )}
          {isPartMergeKey && (
            <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
              <KeyRound className="size-3" />
              매칭키
            </span>
          )}
          {isRelationColumn && relationBadgeType && (
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
          )}
          {issueMessage && (
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
          )}
          <button
            className="rounded p-0.5 text-gray-300 transition-colors hover:text-red-400"
            onClick={() => handleRemove(card, columnId, ctx)}
            aria-label="매핑 제거"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function getCardIssueMessage(card: KanbanCardData, columnId: KanbanColumnId): string | null {
  if (columnId === "unmapped") return null;

  if (columnId === "Part") {
    if (!card.isExtended && !card.targetProperty) return "속성을 선택해주세요.";
    return null;
  }

  if (card.relProperty !== undefined) {
    return card.relProperty ? null : "속성을 선택해주세요.";
  }

  if (!card.relNodeProperty) return "기본 속성을 선택해주세요.";
  return null;
}

function getRelationBadgeType(
  card: KanbanCardData,
  columnId: KanbanColumnId,
  ctx: ReturnType<typeof useKanbanContext>,
): "merge" | "rel" | null {
  if (card.relProperty !== undefined) {
    return card.relProperty ? "rel" : null;
  }

  const relType = card.relType || COLUMN_TO_REL_TYPE[columnId];
  if (!relType) return null;

  const mergeKeys = ctx.relationTargetInfoByType[relType]?.targetMergeKeys || [];
  const nodeProperty = card.relNodeProperty || "";
  if (!nodeProperty) return null;

  return mergeKeys.includes(nodeProperty) ? "merge" : null;
}

function RelationSelect({
  card,
  columnId,
  ctx,
}: {
  card: KanbanCardData;
  columnId: KanbanColumnId;
  ctx: ReturnType<typeof useKanbanContext>;
}) {
  const { t } = useTranslation(["mapping"]);
  const relType = card.relType || COLUMN_TO_REL_TYPE[columnId] || "CONSISTS_OF";
  const targetInfo = ctx.relationTargetInfoByType[relType];
  const baseProperties = targetInfo?.targetProperties || targetInfo?.targetMergeKeys || [];
  const relationProperties = ctx.relationPropertyByType[relType] || [];
  const mergeKeys = targetInfo?.targetMergeKeys || [];

  const selectValue = card.relProperty !== undefined
    ? (card.relProperty ? `rel:${card.relProperty}` : UNSELECTED_VALUE)
    : card.relNodeProperty
      ? `node:${card.relNodeProperty}`
      : UNSELECTED_VALUE;

  const handleChange = (value: string) => {
    if (value === UNSELECTED_VALUE) {
      ctx.onSetRelationCardMapping(relType, card.sourceColumn, "rel", "");
      return;
    }
    const [mappingType, property] = value.split(":");
    if (!property) return;
    if (mappingType === "node" || mappingType === "rel") {
      ctx.onSetRelationCardMapping(relType, card.sourceColumn, mappingType, property);
    }
  };

  return (
    <Select value={selectValue} onValueChange={handleChange}>
      <SelectTrigger className="h-7 w-[160px] shrink-0 border-gray-200 px-2 text-xs">
        <SelectValue placeholder="선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSELECTED_VALUE} className="text-xs text-gray-500">
          {t("mapping:selectProperty", "속성 선택")}
        </SelectItem>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel className="px-2 py-1 text-[10px] font-semibold text-gray-500">
            기본 속성
          </SelectLabel>
          {baseProperties.map((prop) => (
            <SelectItemWithTooltip
              key={`node:${prop}`}
              value={`node:${prop}`}
              display={t(`mapping:property.${prop}`, prop)}
              original={prop}
              required={mergeKeys.includes(prop)}
            />
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel className="px-2 py-1 text-[10px] font-semibold text-gray-500">
            관계 속성
          </SelectLabel>
          {relationProperties.map((prop) => (
            <SelectItemWithTooltip
              key={`rel:${prop}`}
              value={`rel:${prop}`}
              display={t(`mapping:property.${prop}`, prop)}
              original={prop}
            />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

// Part 컬럼 통합 Select: 선택 / 기본 속성 / 확장 속성
function PartSelect({
  card,
  ctx,
}: {
  card: KanbanCardData;
  ctx: ReturnType<typeof useKanbanContext>;
}) {
  const { t } = useTranslation(["mapping"]);
  const mappedProperties = new Set(
    ctx.columnMappings
      .filter((cm) => !cm.is_extended && cm.source_column !== card.sourceColumn && cm.target_property)
      .map((cm) => cm.target_property),
  );
  const availableOptions = ctx.effectiveTargetOptions.filter(
    (opt) => !mappedProperties.has(opt.property),
  );
  const partMergeKeys = new Set(ctx.mergeKeysByLabel.Part || []);

  const selectValue = card.isExtended
    ? EXTENDED_VALUE
    : card.targetProperty || UNSELECTED_VALUE;

  return (
    <Select
      value={selectValue}
      onValueChange={(value) =>
        ctx.onSetPartMapping(card.sourceColumn, value === UNSELECTED_VALUE ? "" : value)
      }
    >
      <SelectTrigger className="h-7 w-[160px] shrink-0 border-gray-200 px-2 text-xs">
        <SelectValue placeholder="선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSELECTED_VALUE} className="text-xs text-gray-500">
          {t("mapping:selectProperty", "속성 선택")}
        </SelectItem>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel className="px-2 py-1 text-[10px] font-semibold text-gray-500">
            기본 속성
          </SelectLabel>
          {availableOptions.map((opt) => (
            <SelectItemWithTooltip
              key={opt.property}
              value={opt.property}
              display={t(`mapping:property.${opt.property}`, opt.property)}
              original={opt.property}
              required={partMergeKeys.has(opt.property)}
            />
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value={EXTENDED_VALUE} className="text-xs text-amber-600">
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
      {required && (
        <span className="text-[10px] font-semibold text-red-500" aria-label="필수">
          *
        </span>
      )}
    </span>
  );

  if (display === original) {
    return (
      <SelectItem value={value} className="text-xs">
        {content}
      </SelectItem>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SelectItem value={value} className="text-xs">
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

// 매핑 제거 핸들러
function handleRemove(
  card: KanbanCardData,
  columnId: KanbanColumnId,
  ctx: ReturnType<typeof useKanbanContext>,
) {
  if (columnId === "Part") {
    const existing = ctx.columnMappings.find(
      (cm) => cm.source_column === card.sourceColumn,
    );
    if (!existing) return;
    // empty target("선택" 상태)이나 확장 속성은 검증 없이 직접 제거
    if (!existing.target_property || existing.is_extended) {
      const state = useMappingStore.getState();
      state.setMappings(
        state.columnMappings.filter((cm) => cm.id !== existing.id),
        state.relationMappings,
      );
    } else {
      void ctx.onRemoveColumnMapping(existing.id);
    }
    return;
  }

  // 관계 컬럼
  const rm = ctx.relationMappings.find(
    (r) =>
      !r.dismissed &&
      (Object.values(r.node_columns).includes(card.sourceColumn) ||
        Object.keys(r.rel_columns).includes(card.sourceColumn)),
  );
  if (rm) ctx.onRemoveRelationCardMapping(card.sourceColumn);
}
