import { CheckCircle2, Columns3, GitBranch, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface MappingSummaryBarProps {
  columnMappingCount: number;
  relationMappingCount: number;
  unmappedCount: number;
  approvedCount: number;
  totalMappings: number;
  onApproveAll: () => void;
  onReset: () => void;
}

export function MappingSummaryBar({
  columnMappingCount,
  relationMappingCount,
  unmappedCount,
  approvedCount,
  totalMappings,
  onApproveAll,
  onReset,
}: MappingSummaryBarProps) {
  const { t } = useTranslation(["common", "mapping"]);
  const progressPercent = totalMappings > 0 ? Math.round((approvedCount / totalMappings) * 100) : 0;
  const pendingCount = totalMappings - approvedCount;

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
      {/* 4칸 통계 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-blue-100 bg-white px-3 py-2.5">
          <Columns3 className="size-4 text-blue-500" />
          <div>
            <p className="text-xs text-blue-600">{t("mapping:columnMapping")}</p>
            <p className="text-lg font-bold text-blue-700">{columnMappingCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-violet-100 bg-white px-3 py-2.5">
          <GitBranch className="size-4 text-violet-500" />
          <div>
            <p className="text-xs text-violet-600">{t("mapping:relationMapping")}</p>
            <p className="text-lg font-bold text-violet-700">{relationMappingCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-green-100 bg-white px-3 py-2.5">
          <CheckCircle2 className="size-4 text-green-500" />
          <div>
            <p className="text-xs text-green-600">{t("common:approved")}</p>
            <p className="text-lg font-bold text-green-700">
              {approvedCount}
              <span className="text-sm font-normal text-gray-400"> / {totalMappings}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white px-3 py-2.5">
          <HelpCircle className="size-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">{t("mapping:excluded")}</p>
            <p className="text-lg font-bold text-gray-700">
              {unmappedCount}
              <span className="text-sm font-normal text-gray-400"> / {totalMappings}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress 바 + 액션 버튼 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{t("mapping:approvalProgress")}</span>
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
            {t("common:reset")}
          </Button>
          <Button
            size="sm"
            className="h-8 bg-blue-600 text-xs hover:bg-blue-700"
            onClick={onApproveAll}
            disabled={pendingCount === 0}
          >
            {t("mapping:approveAll")} ({pendingCount})
          </Button>
        </div>
      </div>
    </div>
  );
}
