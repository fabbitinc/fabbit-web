import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { TargetPropertyOption } from "@/features/onboarding/types/onboarding.types";
import { TargetSelector } from "./TargetSelector";

interface UnmappedCardProps {
  column: string;
  sampleData: string[];
  targetOptions: TargetPropertyOption[];
  onCreate: (sourceColumn: string, targetLabel: string, targetProperty: string) => void;
}

export function UnmappedCard({
  column,
  sampleData,
  targetOptions,
  onCreate,
}: UnmappedCardProps) {
  const { t } = useTranslation(["mapping"]);
  const [selectedTarget, setSelectedTarget] = useState<string>("");

  const handleCreate = () => {
    if (selectedTarget) {
      const dotIdx = selectedTarget.indexOf(".");
      onCreate(column, selectedTarget.slice(0, dotIdx), selectedTarget.slice(dotIdx + 1));
      setSelectedTarget("");
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/30 px-5 py-4">
      <div className="grid grid-cols-[140px_1fr_auto] items-center gap-3">
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">원본</div>
          <div className="truncate text-[15px] font-bold text-gray-900" title={column}>{column}</div>
        </div>
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">샘플 데이터</div>
          <div className="truncate text-sm text-gray-500" title={sampleData.join(", ")}>
            {sampleData.length > 0 ? sampleData.join(", ") : "—"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <TargetSelector
            value={selectedTarget || undefined}
            targets={targetOptions}
            onChange={setSelectedTarget}
            placeholder={t("mapping:selectTarget")}
            className="w-[120px]"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-16 justify-center border-blue-200 px-0 text-xs font-semibold text-blue-700 hover:bg-blue-50"
            disabled={!selectedTarget}
            onClick={handleCreate}
          >
            <Plus className="mr-1 size-3.5" />
            {t("mapping:createMapping")}
          </Button>
        </div>
      </div>
    </div>
  );
}
