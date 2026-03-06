import { Check, GitBranch, GripVertical, Puzzle } from "lucide-react";
import type { KanbanCardData } from "@/features/part-template-mapping/hooks/use-template-mapping-kanban";

interface KanbanDragOverlayProps {
  card: KanbanCardData;
}

export function KanbanDragOverlay({ card }: KanbanDragOverlayProps) {
  const mappedTarget = card.targetProperty || card.relProperty || card.relNodeProperty;

  return (
    <div className="flex w-[320px] items-center gap-2 rounded-2xl border border-primary/30 bg-background px-3 py-2 shadow-lg">
      <div className="rounded p-0.5 text-muted-foreground">
        <GripVertical className="size-3.5" />
      </div>
      <span className="truncate text-xs font-medium text-foreground">{card.sourceColumn}</span>
      {mappedTarget && (
        <>
          <span className="text-[10px] text-muted-foreground">→</span>
          <span className="truncate text-[10px] text-muted-foreground">{mappedTarget}</span>
        </>
      )}
      {card.isExtended && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--status-warning-bg)] px-2 py-0.5 text-[10px] text-[var(--status-warning)]">
          <Puzzle className="size-3" />
          확장
        </span>
      )}
      {card.isRelation && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
          <GitBranch className="size-3" />
          관계
        </span>
      )}
      <div className="ml-auto">
        {card.approved && <Check className="size-3.5 text-[var(--status-success)]" />}
      </div>
    </div>
  );
}
