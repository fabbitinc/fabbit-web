import { GripVertical, Check, Puzzle, GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { KanbanCardData } from "@/features/onboarding/hooks/useMappingKanban";

interface KanbanDragOverlayProps {
  card: KanbanCardData;
}

export function KanbanDragOverlay({ card }: KanbanDragOverlayProps) {
  const { t } = useTranslation(["mapping"]);
  const mapped = card.targetProperty
    ? t(`mapping:property.${card.targetProperty}`, card.targetProperty)
    : card.relProperty
      ? t(`mapping:property.${card.relProperty}`, card.relProperty)
      : undefined;

  return (
    <div className="flex w-[300px] items-center gap-2 rounded-md border border-blue-300 bg-white px-2.5 py-2 shadow-lg">
      <div className="shrink-0 rounded p-0.5 text-gray-300">
        <GripVertical className="size-3" />
      </div>

      <span className="shrink-0 text-xs font-medium text-gray-800">
        {card.sourceColumn}
      </span>

      {mapped && (
        <>
          <span className="shrink-0 text-[10px] text-gray-300">→</span>
          <span className="truncate text-[10px] text-gray-500">
            {mapped}
          </span>
        </>
      )}

      {card.isExtended && (
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-amber-50 px-1 py-0.5 text-[10px] text-amber-600">
          <Puzzle className="size-3" />
          확장
        </span>
      )}

      {card.isRelation && (
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-violet-50 px-1 py-0.5 text-[10px] text-violet-600">
          <GitBranch className="size-3" />
          관계
        </span>
      )}

      <div className="ml-auto flex shrink-0 items-center">
        {card.approved && <Check className="size-3.5 text-emerald-500" />}
      </div>
    </div>
  );
}
