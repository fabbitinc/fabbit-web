import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { ExtendedPropertyEntry } from "@/features/onboarding/types/onboarding.types";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import { cn, withOriginal } from "@/lib/utils";

interface ExtendedMappingCardProps {
  mapping: ExtendedPropertyEntry;
  sampleData: string[];
  onApprove: (id: string) => void;
  onRemove: (id: string) => void;
}

const labelBgColor: Record<string, string> = {
  Part: "bg-blue-50 text-blue-700 ring-blue-200/60",
  Supplier: "bg-violet-50 text-violet-700 ring-violet-200/60",
  Drawing: "bg-slate-50 text-slate-600 ring-slate-200/60",
  Project: "bg-teal-50 text-teal-700 ring-teal-200/60",
};

export function ExtendedMappingCard({
  mapping,
  sampleData,
  onApprove,
  onRemove,
}: ExtendedMappingCardProps) {
  const { t } = useTranslation(["common", "mapping"]);
  const isApproved = mapping.approved;
  const localLabel = t(`mapping:nodeLabel.${mapping.target_label}`, mapping.target_label);

  return (
    <div
      className={cn(
        "rounded-xl border px-5 py-4 transition-all",
        isApproved
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
      )}
    >
      <div className="mb-3 grid grid-cols-[140px_1fr] items-center gap-3">
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{MAPPING_TERMS.sourceColumn}</div>
          <div className="truncate text-[15px] font-bold text-gray-900" title={mapping.source_column}>
            {mapping.source_column}
          </div>
        </div>
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">확장 속성</div>
          <span
            className={cn(
              "inline-flex items-baseline gap-1 rounded-lg px-2.5 py-1 ring-1 ring-inset",
              labelBgColor[mapping.target_label] || "bg-gray-50 text-gray-600 ring-gray-200/60",
            )}
          >
            <span className="text-[11px] font-medium opacity-60">
              {withOriginal(localLabel, mapping.target_label)}
            </span>
            <span className="text-[10px] opacity-30">/</span>
            <span className="text-sm font-bold">{mapping.property_name}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">샘플 데이터</div>
          <div className="truncate text-sm text-gray-500" title={sampleData.join(", ")}>
            {sampleData.length > 0 ? sampleData.join(", ") : "—"}
          </div>
        </div>
        <div className="ml-3 flex items-center gap-1.5">
          {isApproved ? (
            <span className="inline-flex w-16 items-center justify-center gap-1 rounded-full bg-emerald-100 py-1 text-xs font-semibold text-emerald-700">
              <Check className="size-3.5" /> {t("common:approved")}
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-16 justify-center border-emerald-200 px-0 text-xs text-emerald-700 hover:bg-emerald-50"
              onClick={() => onApprove(mapping.id)}
            >
              <Check className="mr-1 size-3.5" /> {t("common:approve")}
            </Button>
          )}
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
