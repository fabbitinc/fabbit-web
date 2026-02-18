import { useDraggable } from "@dnd-kit/core";
import { GripVertical, X, Puzzle, GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useMappingStore } from "@/stores/onboarding";
import {
  Select,
  SelectContent,
  SelectItem,
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
import type { KanbanCardData, KanbanColumnId } from "@/features/onboarding/hooks/useMappingKanban";

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
            <RelationBadge card={card} />
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
        {availableOptions.map((opt) => (
          <SelectItemWithTooltip
            key={opt.property}
            value={opt.property}
            display={t(`mapping:property.${opt.property}`, opt.property)}
            original={opt.property}
          />
        ))}
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
}: {
  value: string;
  display: string;
  original: string;
}) {
  if (display === original) {
    return (
      <SelectItem value={value} className="text-xs">
        {display}
      </SelectItem>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SelectItem value={value} className="text-xs">
          {display}
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

// 관계 컬럼 뱃지
function RelationBadge({ card }: { card: KanbanCardData }) {
  const { t } = useTranslation(["mapping"]);
  const label = card.relProperty
    ? `관계속성: ${t(`mapping:property.${card.relProperty}`, card.relProperty)}`
    : `매칭키: ${card.sourceColumn}`;
  return (
    <span className="inline-flex h-7 w-[160px] shrink-0 items-center gap-1 truncate rounded bg-violet-50 px-2 text-xs text-violet-600">
      <GitBranch className="size-3.5 shrink-0" />
      {label}
    </span>
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
  if (rm) ctx.onRemoveRelationMapping(rm.id);
}
