import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./KanbanCard";
import type { KanbanColumn as KanbanColumnType } from "@/features/onboarding/hooks/useMappingKanban";

// 컬럼별 색상
const COLUMN_COLORS: Record<string, { text: string; border: string; dropBg: string }> = {
  blue: { text: "text-blue-600", border: "border-blue-200", dropBg: "bg-blue-50/50" },
  indigo: { text: "text-indigo-600", border: "border-indigo-200", dropBg: "bg-indigo-50/50" },
  emerald: { text: "text-emerald-600", border: "border-emerald-200", dropBg: "bg-emerald-50/50" },
  amber: { text: "text-amber-600", border: "border-amber-200", dropBg: "bg-amber-50/50" },
  violet: { text: "text-violet-600", border: "border-violet-200", dropBg: "bg-violet-50/50" },
  gray: { text: "text-gray-500", border: "border-gray-300", dropBg: "bg-gray-50" },
};

interface KanbanColumnProps {
  column: KanbanColumnType;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
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
