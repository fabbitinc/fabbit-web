import { Wand2, CheckCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MappingToolbarProps {
  totalConnections: number;
  approvedConnections: number;
  onAutoMap: () => void;
  onApproveAll: () => void;
  onReset: () => void;
}

export function MappingToolbar({
  totalConnections,
  approvedConnections,
  onAutoMap,
  onApproveAll,
  onReset,
}: MappingToolbarProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border-b border-[#e2e8f0]">
      {/* 좌측: 제목 + 진행률 */}
      <div className="flex items-center gap-3 flex-1">
        <h3 className="text-sm font-semibold text-[#0f172a]">AI 매핑</h3>
        <span className="text-xs text-[#94a3b8]">
          {approvedConnections}/{totalConnections} 매핑됨
        </span>
      </div>

      {/* 우측: 버튼 그룹 */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onAutoMap}>
          <Wand2 className="size-3.5" />
          자동 매핑
        </Button>
        <Button variant="outline" size="sm" onClick={onApproveAll}>
          <CheckCheck className="size-3.5" />
          모두 승인
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="size-3.5" />
          리셋
        </Button>
      </div>
    </div>
  );
}
