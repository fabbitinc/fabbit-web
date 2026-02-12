import { CheckCircle2, Clock, FileSpreadsheet, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface MappingSummaryBarProps {
  totalSources: number;
  mappedCount: number;
  approvedCount: number;
  pendingCount: number;
  unmappedCount: number;
  onApproveAll: () => void;
  onReset: () => void;
}

export function MappingSummaryBar({
  totalSources,
  mappedCount,
  approvedCount,
  pendingCount,
  unmappedCount,
  onApproveAll,
  onReset,
}: MappingSummaryBarProps) {
  const progressPercent = Math.round((approvedCount / totalSources) * 100);

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
      {/* 4칸 통계 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2.5 border border-gray-100">
          <FileSpreadsheet className="size-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">전체 컬럼</p>
            <p className="text-lg font-bold text-gray-900">{totalSources}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2.5 border border-blue-100">
          <CheckCircle2 className="size-4 text-blue-500" />
          <div>
            <p className="text-xs text-blue-600">매핑됨</p>
            <p className="text-lg font-bold text-blue-700">{mappedCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2.5 border border-amber-100">
          <Clock className="size-4 text-amber-500" />
          <div>
            <p className="text-xs text-amber-600">승인 대기</p>
            <p className="text-lg font-bold text-amber-700">{pendingCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2.5 border border-gray-100">
          <Unlink className="size-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">미매핑</p>
            <p className="text-lg font-bold text-gray-600">{unmappedCount}</p>
          </div>
        </div>
      </div>

      {/* Progress 바 + 액션 버튼 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">승인 진행률</span>
            <span className="font-medium text-gray-700">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={onReset}
          >
            리셋
          </Button>
          <Button
            size="sm"
            className="h-8 bg-blue-600 hover:bg-blue-700 text-xs"
            onClick={onApproveAll}
            disabled={pendingCount === 0}
          >
            모두 승인 ({pendingCount})
          </Button>
        </div>
      </div>
    </div>
  );
}
