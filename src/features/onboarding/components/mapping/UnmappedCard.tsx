import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TargetPropertyOption } from "@/features/onboarding/types/onboarding.types";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import { TargetSelector } from "./TargetSelector";
import { withOriginal } from "@/lib/utils";

interface UnmappedCardProps {
  column: string;
  sampleData: string[];
  targetOptions: TargetPropertyOption[];
  onCreateBase: (sourceColumn: string, targetLabel: string, targetProperty: string) => void;
  onCreateExtended: (sourceColumn: string, targetLabel: string) => void;
}

export function UnmappedCard({
  column,
  sampleData,
  targetOptions,
  onCreateBase,
  onCreateExtended,
}: UnmappedCardProps) {
  const { t } = useTranslation(["mapping"]);
  const [selectedBaseTarget, setSelectedBaseTarget] = useState<string>("");
  const [selectedExtendedLabel, setSelectedExtendedLabel] = useState<string>("");

  const labels = [...new Set(targetOptions.map((opt) => opt.label))].sort((a, b) =>
    a.localeCompare(b),
  );

  const handleCreateBase = () => {
    if (selectedBaseTarget) {
      const dotIdx = selectedBaseTarget.indexOf(".");
      onCreateBase(
        column,
        selectedBaseTarget.slice(0, dotIdx),
        selectedBaseTarget.slice(dotIdx + 1),
      );
      setSelectedBaseTarget("");
    }
  };

  const handleCreateExtended = () => {
    if (selectedExtendedLabel) {
      onCreateExtended(column, selectedExtendedLabel);
      setSelectedExtendedLabel("");
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/30 px-5 py-4">
      <div className="grid grid-cols-[140px_1fr_auto] items-center gap-3">
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{MAPPING_TERMS.sourceColumn}</div>
          <div className="truncate text-[15px] font-bold text-gray-900" title={column}>{column}</div>
        </div>
        <div className="min-w-0">
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">샘플 데이터</div>
          <div className="truncate text-sm text-gray-500" title={sampleData.join(", ")}>
            {sampleData.length > 0 ? sampleData.join(", ") : "—"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TargetSelector
            value={selectedBaseTarget || undefined}
            targets={targetOptions}
            onChange={setSelectedBaseTarget}
            placeholder={`${MAPPING_TERMS.targetProperty} 선택`}
            className="w-[126px]"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-16 justify-center border-blue-200 px-0 text-xs font-semibold text-blue-700 hover:bg-blue-50"
            disabled={!selectedBaseTarget}
            onClick={handleCreateBase}
          >
            <Plus className="mr-1 size-3.5" />
            매핑
          </Button>

          <Select value={selectedExtendedLabel} onValueChange={setSelectedExtendedLabel}>
            <SelectTrigger className="h-7 w-[110px] text-xs">
              <SelectValue placeholder="확장 라벨" />
            </SelectTrigger>
            <SelectContent>
              {labels.map((label) => (
                <SelectItem key={label} value={label} className="text-xs">
                  {withOriginal(t(`mapping:nodeLabel.${label}`, label), label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-16 justify-center border-violet-200 px-0 text-xs font-semibold text-violet-700 hover:bg-violet-50"
            disabled={!selectedExtendedLabel}
            onClick={handleCreateExtended}
          >
            <Plus className="mr-1 size-3.5" />
            확장
          </Button>
        </div>
      </div>
    </div>
  );
}
