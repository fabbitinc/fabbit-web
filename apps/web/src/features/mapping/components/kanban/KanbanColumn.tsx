import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KanbanCard } from "./KanbanCard";
import type { KanbanColumn as KanbanColumnType } from "@/features/mapping/hooks/useMappingKanban";

// 컬럼별 색상(테마 토큰 클래스)
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
  column: KanbanColumnType;
  mappingHeaders?: string[];
  issueCount?: number;
  issueSummary?: string;
}

export function KanbanColumn({ column, issueCount = 0, issueSummary = "" }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const colors = COLUMN_COLORS[column.color] || COLUMN_COLORS.gray;
  const total = column.cards.length;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border bg-white transition-colors",
        isOver ? colors.border : "border-gray-200",
        isOver && colors.dropBg,
      )}
    >
      {/* 라벨 + 카드 수 */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-1">
        <h3 className={cn("text-sm font-bold", colors.text)}>
          {column.title}
        </h3>
        <span className="text-xs text-gray-400">{total}</span>
        {issueCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                {issueCount}개 미완료
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={8}
              hideArrow
              className="max-w-[280px] rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white"
            >
              {issueSummary || `${issueCount}개 항목을 확인해주세요.`}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* 카드 세로 리스트 */}
      <div className="flex flex-col gap-1 px-4 py-2">
        {column.cards.length === 0 ? (
          <p className="py-3 text-xs text-gray-300">카드를 여기에 놓으세요</p>
        ) : (
          column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} columnId={column.id} />
          ))
        )}
      </div>
    </div>
  );
}
