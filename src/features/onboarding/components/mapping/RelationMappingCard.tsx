import { ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RelationMappingEntry } from "@/features/onboarding/types/onboarding.types";
import {
  getDismissedReasonLabel,
  MAPPING_TERMS,
} from "@/features/onboarding/constants/mappingTerminology";
import { cn } from "@/lib/utils";
import { DisplayWithOriginalTooltip } from "./DisplayWithOriginalTooltip";

interface RelationMappingCardProps {
  mapping: RelationMappingEntry;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function RelationMappingCard({
  mapping,
  onApprove,
  onDismiss,
}: RelationMappingCardProps) {
  const { t } = useTranslation(["common", "mapping"]);
  const isApproved = mapping.approved;
  const isDismissed = mapping.dismissed;

  const fromCols = Object.values(mapping.from_columns);
  const toCols = Object.values(mapping.to_columns);
  const fromColsText = fromCols.join(", ") || "—";
  const toColsText = toCols.join(", ") || "—";

  const localFrom = t(`mapping:nodeLabel.${mapping.from_label}`, mapping.from_label);
  const localTo = t(`mapping:nodeLabel.${mapping.to_label}`, mapping.to_label);
  const localRel = t(`mapping:relType.${mapping.rel_type}`, mapping.rel_type);

  const relationFlowDisplay = `${localFrom} -> ${localRel} -> ${localTo}`;
  const relationFlowOriginal = `${mapping.from_label} -> ${mapping.rel_type} -> ${mapping.to_label}`;

  const propEntries = Object.entries(mapping.properties);
  const propText =
    propEntries.length > 0
      ? propEntries
          .map(([sourceColumn, relProp]) => {
            const localProp = t(`mapping:property.${relProp}`, relProp);
            const display = `${sourceColumn} -> ${localProp}`;
            const original = `${sourceColumn} -> ${relProp}`;
            return { display, original };
          })
      : [];

  const firstPropEntry = propEntries[0];
  const firstRelProp = firstPropEntry?.[1] || "";
  const firstType = firstRelProp ? mapping.property_types[firstRelProp] : undefined;
  const localType = firstType ? t(`common:dataType.${firstType}`, firstType) : "-";

  const dismissedReasonLabel = getDismissedReasonLabel(mapping.dismissed_reason);

  return (
    <div
      className={cn(
        "rounded-xl border px-5 py-4 transition-all",
        isDismissed
          ? "border-gray-200 bg-gray-50/60 opacity-70"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
      )}
    >
      <div className="mb-3 grid grid-cols-[minmax(220px,1fr)_16px_1fr] items-center gap-3">
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {MAPPING_TERMS.relationKeySource} / {MAPPING_TERMS.relationKeyTarget}
          </div>
          <div className="truncate text-[15px] font-bold text-gray-900" title={`${fromColsText} -> ${toColsText}`}>
            {fromColsText} {"->"} {toColsText}
          </div>
        </div>
        <ChevronRight className="mt-3 size-4 text-gray-300" />
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            관계 타입 / 관계 속성
          </div>
          <p className="text-[15px] font-bold text-gray-900">
            <DisplayWithOriginalTooltip
              display={`${localRel} / ${firstRelProp ? t(`mapping:property.${firstRelProp}`, firstRelProp) : "-"}`}
              original={`${mapping.rel_type} / ${firstRelProp || "-"}`}
            />
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-100 pt-3">
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            관계 흐름
          </div>
          <p className="text-sm font-semibold text-gray-700">
            <DisplayWithOriginalTooltip display={relationFlowDisplay} original={relationFlowOriginal} />
          </p>
        </div>

        <div className="grid grid-cols-[minmax(140px,1fr)_100px_80px_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {MAPPING_TERMS.relationProperty}
            </div>
            <div className="truncate text-sm text-gray-500" title={propText.map((item) => item.original).join(", ")}>
              {propText.length > 0 ? (
                <DisplayWithOriginalTooltip
                  display={propText.map((item) => item.display).join(", ")}
                  original={propText.map((item) => item.original).join(", ")}
                />
              ) : (
                "—"
              )}
            </div>
          </div>
          <div>
            <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              데이터 타입
            </div>
            <div className="text-sm font-semibold text-gray-700">
              <DisplayWithOriginalTooltip display={localType} original={firstType} />
            </div>
          </div>
          <div>
            <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              신뢰도
            </div>
            <div className="text-sm font-semibold text-gray-700">-</div>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            <div className="w-16">
              {isApproved ? (
                <Badge variant="outline" className="w-full justify-center border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                  할당됨
                </Badge>
              ) : (
                <Button variant="outline" size="sm" className="h-7 w-full text-xs" onClick={() => onApprove(mapping.id)}>
                  할당
                </Button>
              )}
            </div>

            {!isDismissed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-300 hover:bg-red-50 hover:text-red-500"
                onClick={() => onDismiss(mapping.id)}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {isDismissed && dismissedReasonLabel && (
        <div className="mt-2 text-xs text-amber-700">제외 사유: {dismissedReasonLabel}</div>
      )}
    </div>
  );
}
