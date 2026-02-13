import { CheckCircle2, Columns3, GitBranch, HelpCircle, ScrollText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";

interface MappingSummaryBarProps {
  columnMappingCount: number;
  relationMappingCount: number;
  extendedMappingCount: number;
  unmappedCount: number;
  approvedCount: number;
  totalMappings: number;
  onApproveAll: () => void;
  onReset: () => void;
}

export function MappingSummaryBar({
  columnMappingCount,
  relationMappingCount,
  extendedMappingCount,
  unmappedCount,
  approvedCount,
  totalMappings,
  onApproveAll,
  onReset,
}: MappingSummaryBarProps) {
  const { t } = useTranslation(["common", "mapping"]);
  const progressPercent = totalMappings > 0 ? Math.round((approvedCount / totalMappings) * 100) : 0;
  const pendingCount = totalMappings - approvedCount;

  const metrics = [
    {
      key: "base",
      label: MAPPING_TERMS.baseMapping,
      value: String(columnMappingCount),
      icon: Columns3,
      tone: "text-blue-600",
    },
    {
      key: "relation",
      label: MAPPING_TERMS.relationMapping,
      value: String(relationMappingCount),
      icon: GitBranch,
      tone: "text-violet-600",
    },
    {
      key: "extended",
      label: MAPPING_TERMS.extendedMapping,
      value: String(extendedMappingCount),
      icon: ScrollText,
      tone: "text-amber-600",
    },
    {
      key: "approved",
      label: t("common:approved"),
      value: `${approvedCount} / ${totalMappings}`,
      icon: CheckCircle2,
      tone: "text-emerald-600",
    },
    {
      key: "excluded",
      label: t("mapping:excluded"),
      value: String(unmappedCount),
      icon: HelpCircle,
      tone: "text-red-600",
    },
  ] as const;

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="rounded-lg border border-gray-200 bg-gray-50/40 px-3 py-2.5">
              <div className="mb-1 flex items-center gap-1.5">
                <Icon className={cn("size-4", item.tone)} />
                <span className={cn("text-xs font-semibold", item.tone)}>{item.label}</span>
              </div>
              <div className="flex items-center justify-end pr-1">
                <p className="text-right text-xl font-bold text-gray-800">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{t("mapping:approvalProgress")}</span>
            <span className="font-medium text-gray-700">{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-gray-800 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
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
