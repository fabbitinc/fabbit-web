import { Check, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { ColumnMappingEntry, TargetPropertyOption } from "@/features/onboarding/types/onboarding.types";
import { getConfidenceLevel } from "@/features/onboarding/types/onboarding.types";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import { TargetSelector } from "./TargetSelector";
import { cn, withOriginal } from "@/lib/utils";

interface MappingCardProps {
  mapping: ColumnMappingEntry;
  sampleData: string[];
  targetOptions: TargetPropertyOption[];
  onApprove: (id: string) => void;
  onChangeTarget: (id: string, targetLabel: string, targetProperty: string) => void;
  onRemove: (id: string) => void;
}

const confidenceDotColor = {
  high: "bg-emerald-400",
  medium: "bg-amber-400",
  low: "bg-red-400",
};

const confidenceTextColor = {
  high: "text-emerald-600",
  medium: "text-amber-600",
  low: "text-red-600",
};

const labelBgColor: Record<string, string> = {
  Part: "bg-blue-50 text-blue-700 ring-blue-200/60",
  Supplier: "bg-violet-50 text-violet-700 ring-violet-200/60",
  Drawing: "bg-slate-50 text-slate-600 ring-slate-200/60",
  Project: "bg-teal-50 text-teal-700 ring-teal-200/60",
};

export function MappingCard({
  mapping,
  sampleData,
  targetOptions,
  onApprove,
  onChangeTarget,
  onRemove,
}: MappingCardProps) {
  const { t } = useTranslation(["common", "mapping"]);
  const isApproved = mapping.approved;
  const level = getConfidenceLevel(mapping.confidence);

  const localLabel = t(`mapping:nodeLabel.${mapping.target_label}`, mapping.target_label);
  const localProp = t(`mapping:property.${mapping.target_property}`, mapping.target_property);
  const localType = t(`common:dataType.${mapping.data_type}`, mapping.data_type);

  return (
    <div
      className={cn(
        "rounded-xl border px-5 py-4 transition-all",
        isApproved
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      )}
    >
      {/* 1행: 원본 컬럼 → 대상 라벨/속성 */}
      <div className="mb-3 grid grid-cols-[140px_16px_1fr] items-center gap-3">
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{MAPPING_TERMS.sourceColumn}</div>
          <div className="truncate text-[15px] font-bold text-gray-900" title={mapping.source_column}>{mapping.source_column}</div>
        </div>
        <ChevronRight className="mt-3 size-4 text-gray-300" />
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{MAPPING_TERMS.targetLabel} / {MAPPING_TERMS.targetProperty}</div>
          <span className={cn(
            "inline-flex items-baseline gap-1 rounded-lg px-2.5 py-1 ring-1 ring-inset",
            labelBgColor[mapping.target_label] || "bg-gray-50 text-gray-600 ring-gray-200/60"
          )}>
            <span className="text-[11px] font-medium opacity-60">{withOriginal(localLabel, mapping.target_label)}</span>
            <span className="text-[10px] opacity-30">/</span>
            <span className="text-sm font-bold">{withOriginal(localProp, mapping.target_property)}</span>
          </span>
        </div>
      </div>

      {/* 2행: 메타 + 액션 */}
      <div className="grid grid-cols-[minmax(140px,1fr)_100px_80px_auto] items-center gap-4 border-t border-gray-100 pt-3">
        <div className="min-w-0">
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">샘플 데이터</div>
          <div className="truncate text-sm text-gray-500" title={sampleData.join(", ")}>{sampleData.join(", ")}</div>
        </div>
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">데이터 타입</div>
          <div className="text-sm text-gray-600">{withOriginal(localType, mapping.data_type)}</div>
        </div>
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">신뢰도</div>
          <div className="flex items-center gap-1" title={mapping.reason}>
            <span className={cn("size-2 rounded-full", confidenceDotColor[level])} />
            <span className={cn("text-sm font-semibold tabular-nums", confidenceTextColor[level])}>{mapping.confidence}%</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <div className="flex w-[134px] items-center justify-end gap-1.5">
            {isApproved ? (
              <>
                <span className="w-16" />
                <span className="inline-flex w-16 items-center justify-center gap-1 rounded-full bg-emerald-100 py-1 text-xs font-semibold text-emerald-700">
                  <Check className="size-3.5" /> {t("common:approved")}
                </span>
              </>
            ) : (
              <>
                <TargetSelector
                  key={`${mapping.target_label}.${mapping.target_property}`}
                  targets={targetOptions}
                  onChange={(value) => {
                    const dotIdx = value.indexOf(".");
                    onChangeTarget(mapping.id, value.slice(0, dotIdx), value.slice(dotIdx + 1));
                  }}
                  placeholder={t("common:change")}
                  className="w-16"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-16 justify-center border-emerald-200 px-0 text-xs text-emerald-700 hover:bg-emerald-50"
                  onClick={() => onApprove(mapping.id)}
                >
                  <Check className="mr-1 size-3.5" /> {t("common:approve")}
                </Button>
              </>
            )}
          </div>
          <button
            className="rounded p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
            onClick={() => onRemove(mapping.id)}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
