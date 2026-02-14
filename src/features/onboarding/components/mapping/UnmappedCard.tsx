import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TargetPropertyOption } from "@/features/onboarding/types/onboarding.types";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import { UnmappedBaseForm } from "./UnmappedBaseForm";
import { UnmappedExtendedForm } from "./UnmappedExtendedForm";
import { UnmappedRelationForm } from "./UnmappedRelationForm";
import { cn } from "@/lib/utils";

type ResolveMode = "base" | "extended" | "relation_prop";

interface UnmappedCardProps {
  column: string;
  sampleData: string[];
  targetOptions: TargetPropertyOption[];
  relationTypeOptions?: string[];
  relationPropertyByType?: Record<string, string[]>;
  relationFromToOptions?: string[];
  relationEndpointOptionsByType?: Record<
    string,
    { fromColumns: string[]; toColumns: string[]; fromLabel: string; toLabel: string; fromMergeKey?: string; toMergeKey?: string }
  >;
  onCreateBase: (sourceColumn: string, targetLabel: string, targetProperty: string) => void;
  onCreateExtended: (sourceColumn: string, targetLabel: string, propertyName?: string) => void;
  onCreateRelation: (
    sourceColumn: string,
    relType: string,
    fromSourceColumn: string,
    toSourceColumn: string,
    relationProperty: string,
  ) => void;
}

export function UnmappedCard({
  column,
  sampleData,
  targetOptions,
  relationTypeOptions = [],
  relationPropertyByType = {},
  relationFromToOptions = [],
  relationEndpointOptionsByType = {},
  onCreateBase,
  onCreateExtended,
  onCreateRelation,
}: UnmappedCardProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ResolveMode>("base");

  const labels = useMemo(
    () => [...new Set(targetOptions.map((opt) => opt.label))].sort((a, b) => a.localeCompare(b)),
    [targetOptions],
  );

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "rounded-xl border bg-white px-5 py-4 transition-all hover:border-gray-300 hover:shadow-sm",
          open ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200",
        )}
      >
        <div className="grid grid-cols-[160px_1fr] gap-3">
          <div>
            <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {MAPPING_TERMS.sourceColumn}
            </div>
            <div className="truncate text-[15px] font-bold text-gray-900" title={column}>
              {column}
            </div>
          </div>
          <div>
            <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              라벨 / 속성
            </div>
            <p className="text-[15px] font-bold text-gray-900">미할당</p>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(140px,1fr)_100px_80px_auto] items-center gap-4 border-t border-gray-100 pt-3">
          <div className="min-w-0">
            <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              샘플 데이터
            </div>
            <div className="truncate text-sm text-gray-500" title={sampleData.join(", ")}>
              {sampleData.length > 0 ? sampleData.join(", ") : "샘플 없음"}
            </div>
          </div>
          <div>
            <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              데이터 타입
            </div>
            <div className="text-sm font-semibold text-gray-700">-</div>
          </div>
          <div>
            <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              신뢰도
            </div>
            <div className="text-sm font-semibold text-gray-700">-</div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Badge variant="outline" className="border-red-200 bg-red-50 text-xs text-red-700">
              미할당
            </Badge>
            <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={() => setOpen((prev) => !prev)}>
              {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          {/* 모드 전환 버튼 */}
          <div className="mb-4 flex items-center gap-2">
            <Button
              type="button"
              variant={mode === "base" ? "default" : "outline"}
              size="sm"
              className={cn("h-7 text-xs", mode === "base" && "bg-gray-900 hover:bg-gray-900")}
              onClick={() => setMode("base")}
            >
              기본 속성
            </Button>
            <Button
              type="button"
              variant={mode === "extended" ? "default" : "outline"}
              size="sm"
              className={cn("h-7 text-xs", mode === "extended" && "bg-gray-900 hover:bg-gray-900")}
              onClick={() => setMode("extended")}
            >
              확장 속성
            </Button>
            <Button
              type="button"
              variant={mode === "relation_prop" ? "default" : "outline"}
              size="sm"
              className={cn("h-7 text-xs", mode === "relation_prop" && "bg-gray-900 hover:bg-gray-900")}
              onClick={() => setMode("relation_prop")}
            >
              관계 속성
            </Button>
          </div>

          {/* 서브폼 렌더링 */}
          <div className="space-y-3">
            {mode === "base" && (
              <UnmappedBaseForm
                column={column}
                labels={labels}
                targetOptions={targetOptions}
                onApply={(src, label, prop) => {
                  onCreateBase(src, label, prop);
                  setOpen(false);
                }}
              />
            )}

            {mode === "extended" && (
              <UnmappedExtendedForm
                column={column}
                labels={labels}
                onApply={(src, label, propName) => {
                  onCreateExtended(src, label, propName);
                  setOpen(false);
                }}
              />
            )}

            {mode === "relation_prop" && (
              <UnmappedRelationForm
                column={column}
                relationTypeOptions={relationTypeOptions}
                relationPropertyByType={relationPropertyByType}
                relationFromToOptions={relationFromToOptions}
                relationEndpointOptionsByType={relationEndpointOptionsByType}
                onApply={(src, relType, from, to, relProp) => {
                  onCreateRelation(src, relType, from, to, relProp);
                  setOpen(false);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
