import { ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ExtendedPropertyEntry } from "@/features/onboarding/types/onboarding.types";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import { DisplayWithOriginalTooltip } from "./DisplayWithOriginalTooltip";

interface ExtendedMappingCardProps {
  mapping: ExtendedPropertyEntry;
  sampleData: string[];
  onApprove: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ExtendedMappingCard({
  mapping,
  sampleData,
  onApprove,
  onRemove,
}: ExtendedMappingCardProps) {
  const { t } = useTranslation(["common", "mapping"]);
  const isApproved = mapping.approved;

  const localLabel = t(`mapping:nodeLabel.${mapping.target_label}`, mapping.target_label);
  const localProp = t(`mapping:property.${mapping.property_name}`, mapping.property_name);
  const localType = t(`common:dataType.${mapping.data_type}`, mapping.data_type);

  const targetDisplay = `${localLabel} / ${localProp}`;
  const targetOriginal = `${mapping.target_label} / ${mapping.property_name}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 transition-all hover:border-gray-300 hover:shadow-sm">
      <div className="mb-3 grid grid-cols-[140px_16px_1fr] items-center gap-3">
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {MAPPING_TERMS.sourceColumn}
          </div>
          <div className="truncate text-[15px] font-bold text-gray-900" title={mapping.source_column}>
            {mapping.source_column}
          </div>
        </div>
        <ChevronRight className="mt-3 size-4 text-gray-300" />
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            라벨 / 속성
          </div>
          <p className="text-[15px] font-bold text-gray-900">
            <DisplayWithOriginalTooltip display={targetDisplay} original={targetOriginal} />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(140px,1fr)_100px_80px_auto] items-center gap-4 border-t border-gray-100 pt-3">
        <div className="min-w-0">
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            샘플 데이터
          </div>
          <div className="truncate text-sm text-gray-500" title={sampleData.join(", ")}>
            {sampleData.length > 0 ? sampleData.join(", ") : "—"}
          </div>
        </div>
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            데이터 타입
          </div>
          <div className="text-sm font-semibold text-gray-700">
            <DisplayWithOriginalTooltip display={localType} original={mapping.data_type} />
          </div>
        </div>
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            신뢰도
          </div>
          <div className="text-sm font-semibold tabular-nums text-gray-700" title={mapping.reason}>
            {mapping.confidence}%
          </div>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          {isApproved ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
              할당됨
            </Badge>
          ) : (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onApprove(mapping.id)}>
              할당
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-300 hover:bg-red-50 hover:text-red-500"
            onClick={() => onRemove(mapping.id)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
