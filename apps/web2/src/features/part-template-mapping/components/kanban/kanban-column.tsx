import { useDroppable } from "@dnd-kit/core";
import { Tooltip, TooltipContent, TooltipTrigger } from "@fabbit/ui";
import { cn } from "@/lib/utils";
import type { KanbanColumnModel } from "@/features/part-template-mapping/types/template-mapping-kanban";
import { KanbanCard } from "./kanban-card";

const COLUMN_COLORS: Record<string, { text: string; border: string; dropBg: string }> = {
  blue: {
    text: "mapping-column-part-text",
    border: "mapping-column-part-border",
    dropBg: "mapping-column-part-drop-bg",
  },
  indigo: {
    text: "mapping-column-parent-part-text",
    border: "mapping-column-parent-part-border",
    dropBg: "mapping-column-parent-part-drop-bg",
  },
  emerald: {
    text: "mapping-column-supplier-text",
    border: "mapping-column-supplier-border",
    dropBg: "mapping-column-supplier-drop-bg",
  },
  amber: {
    text: "mapping-column-drawing-text",
    border: "mapping-column-drawing-border",
    dropBg: "mapping-column-drawing-drop-bg",
  },
  violet: {
    text: "mapping-column-project-text",
    border: "mapping-column-project-border",
    dropBg: "mapping-column-project-drop-bg",
  },
  gray: {
    text: "mapping-column-unmapped-text",
    border: "mapping-column-unmapped-border",
    dropBg: "mapping-column-unmapped-drop-bg",
  },
};

interface KanbanColumnProps {
  column: KanbanColumnModel;
  issueCount?: number;
  issueSummary?: string;
}

export function KanbanColumn({
  column,
  issueCount = 0,
  issueSummary = "",
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const colors = COLUMN_COLORS[column.color] ?? COLUMN_COLORS.gray;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-[28px] border bg-card transition-colors",
        isOver ? colors.border : "border-border",
        isOver && colors.dropBg,
      )}
    >
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <h3 className={cn("text-sm font-semibold", colors.text)}>{column.title}</h3>
        <span className="text-xs text-muted-foreground">{column.cards.length}</span>
        {issueCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center rounded-full bg-[var(--status-warning-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--status-warning)]">
                {issueCount}개 미완료
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8} className="max-w-[280px] text-xs">
              {issueSummary || `${issueCount}개 항목을 확인해주세요.`}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4">
        {column.cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
            카드를 여기에 놓으세요
          </div>
        ) : (
          column.cards.map((card) => <KanbanCard key={card.id} card={card} columnId={column.id} />)
        )}
      </div>
    </div>
  );
}
