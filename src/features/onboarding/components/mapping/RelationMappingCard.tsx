import { Check, ChevronRight, RotateCcw, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { RelationMappingEntry } from "@/features/onboarding/types/onboarding.types";
import {
  getDismissedReasonLabel,
  MAPPING_TERMS,
} from "@/features/onboarding/constants/mappingTerminology";
import { cn, withOriginal } from "@/lib/utils";

interface RelationMappingCardProps {
  mapping: RelationMappingEntry;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
  onRestore?: (id: string) => void;
}

const labelBgColor: Record<string, string> = {
  Part: "bg-blue-50 text-blue-700 ring-blue-200/60",
  Supplier: "bg-violet-50 text-violet-700 ring-violet-200/60",
  Drawing: "bg-slate-50 text-slate-600 ring-slate-200/60",
  Project: "bg-teal-50 text-teal-700 ring-teal-200/60",
};

export function RelationMappingCard({
  mapping,
  onApprove,
  onDismiss,
  onRestore,
}: RelationMappingCardProps) {
  const { t } = useTranslation(["common", "mapping"]);
  const isApproved = mapping.approved;
  const isDismissed = mapping.dismissed;
  const propEntries = Object.entries(mapping.properties);

  const fromCols = Object.values(mapping.from_columns).join(", ");
  const toCols = Object.values(mapping.to_columns).join(", ");

  const localFrom = t(`mapping:nodeLabel.${mapping.from_label}`, mapping.from_label);
  const localTo = t(`mapping:nodeLabel.${mapping.to_label}`, mapping.to_label);
  const localRel = t(`mapping:relType.${mapping.rel_type}`, mapping.rel_type);

  const dismissedReasonLabel = getDismissedReasonLabel(mapping.dismissed_reason);

  return (
    <div
      className={cn(
        "rounded-xl border px-5 py-4 transition-all",
        isDismissed
          ? "border-gray-200 bg-gray-50/60 opacity-60"
          : isApproved
            ? "border-emerald-200 bg-emerald-50/40"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      )}
    >
      {/* 1행: 연결 기준 + 관계 속성 */}
      <div className="mb-3 grid grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)] items-end gap-4">
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">연결 기준</div>
          <div className="text-[15px] font-bold text-gray-900">{fromCols} → {toCols}</div>
        </div>
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{MAPPING_TERMS.relationProperty}</div>
          <div className="text-sm text-gray-600">
            {propEntries.length > 0
              ? propEntries.map(([src, rel]) => {
                  const localProp = t(`mapping:property.${rel}`, rel);
                  return `${src} → ${withOriginal(localProp, rel)}`;
                }).join(", ")
              : "—"
            }
          </div>
        </div>
      </div>

      {/* 2행: 관계 흐름 + 액션 */}
      <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset", labelBgColor[mapping.from_label] || "bg-gray-50 text-gray-600 ring-gray-200/60")}>
            {withOriginal(localFrom, mapping.from_label)}
          </span>
          <ChevronRight className="size-4 text-gray-300" />
          <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-bold text-violet-700">
            {withOriginal(localRel, mapping.rel_type)}
          </span>
          <ChevronRight className="size-4 text-gray-300" />
          <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset", labelBgColor[mapping.to_label] || "bg-gray-50 text-gray-600 ring-gray-200/60")}>
            {withOriginal(localTo, mapping.to_label)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="w-16">
            {isDismissed ? (
              onRestore && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-full justify-center border-blue-200 px-0 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                  onClick={() => onRestore(mapping.id)}
                >
                  <RotateCcw className="mr-1 size-3.5" />
                  {t("common:restore")}
                </Button>
              )
            ) : isApproved ? (
              <span className="inline-flex w-full items-center justify-center gap-1 rounded-full bg-emerald-100 py-1 text-xs font-semibold text-emerald-700">
                <Check className="size-3.5" />
                {t("common:approved")}
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-full justify-center border-emerald-200 px-0 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                onClick={() => onApprove(mapping.id)}
              >
                <Check className="mr-1 size-3.5" />
                {t("common:approve")}
              </Button>
            )}
          </div>
          {!isDismissed && (
            <button
              className="rounded p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
              onClick={() => onDismiss(mapping.id)}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
      {isDismissed && dismissedReasonLabel && (
        <div className="mt-2 text-xs text-amber-700">
          제외 사유: {dismissedReasonLabel}
        </div>
      )}
    </div>
  );
}
