import { Check, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type {
  SourceColumn,
  MappingConnection,
} from "@/features/onboarding/types/onboarding.types";

interface SourceColumnPanelProps {
  columns: SourceColumn[];
  connections: MappingConnection[];
  selectedSourceId: string | null;
  onSelectSource: (id: string | null) => void;
  itemRefs: Map<string, HTMLElement>;
}

export function SourceColumnPanel({
  columns,
  connections,
  selectedSourceId,
  onSelectSource,
  itemRefs,
}: SourceColumnPanelProps) {
  const connectedSourceIds = new Set(connections.map((c) => c.sourceId));

  return (
    <div className="w-72 border-r border-[#e2e8f0] bg-white flex flex-col shrink-0">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e2e8f0]">
        <h4 className="text-sm font-semibold text-[#0f172a]">원본 컬럼</h4>
        <Badge variant="secondary" className="text-xs">
          {columns.length}
        </Badge>
      </div>

      {/* 컬럼 목록 */}
      <ScrollArea className="flex-1">
        <div className="py-1.5">
          {columns.map((column) => {
            const isSelected = selectedSourceId === column.id;
            const isConnected = connectedSourceIds.has(column.id);

            return (
              <div
                key={column.id}
                ref={(el) => {
                  if (el) itemRefs.set(column.id, el);
                  else itemRefs.delete(column.id);
                }}
                className={cn(
                  "p-3 mx-3 my-1.5 rounded-lg border cursor-pointer transition-all",
                  isSelected &&
                    "border-[#3b82f6] bg-[#3b82f6]/5 ring-2 ring-[#3b82f6]/20",
                  !isSelected &&
                    isConnected &&
                    "border-[#22c55e]/50 bg-[#22c55e]/5",
                  !isSelected &&
                    !isConnected &&
                    "border-[#e2e8f0] hover:border-[#94a3b8]"
                )}
                onClick={() =>
                  onSelectSource(isSelected ? null : column.id)
                }
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#0f172a]">
                    {column.name}
                  </span>
                  {isConnected && (
                    <Check className="size-3.5 text-[#22c55e]" />
                  )}
                  {isSelected && !isConnected && (
                    <CircleDot className="size-3.5 text-[#3b82f6]" />
                  )}
                </div>
                {/* 샘플 데이터 */}
                <div className="flex flex-wrap gap-1">
                  {column.sampleData.slice(0, 2).map((sample, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-[#94a3b8] font-mono"
                    >
                      {sample}
                      {idx < Math.min(column.sampleData.length, 2) - 1 && ","}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
