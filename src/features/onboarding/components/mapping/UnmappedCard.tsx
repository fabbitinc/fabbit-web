import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  TargetPropertyOption,
  RelationTargetInfo,
} from "@/features/onboarding/types/onboarding.types";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import { UnmappedBaseForm } from "./UnmappedBaseForm";
import { UnmappedRelationForm } from "./UnmappedRelationForm";
import { cn } from "@/lib/utils";

type ResolveMode = "property" | "relation";

interface UnmappedCardProps {
  column: string;
  sampleData: string[];
  targetOptions: TargetPropertyOption[];
  relationTypeOptions?: string[];
  relationPropertyByType?: Record<string, string[]>;
  relationTargetInfoByType?: Record<string, RelationTargetInfo>;
  targetPropertyOptions?: TargetPropertyOption[];
  onCreateBase: (sourceColumn: string, targetProperty: string) => void;
  onCreateExtended: (sourceColumn: string, propertyName?: string) => void;
  onCreateRelation: (
    relType: string,
    nodeColumns: Record<string, string>,
    relColumns: Record<string, string>,
    relColumnTypes: Record<string, string>,
  ) => void;
}

export function UnmappedCard({
  column,
  sampleData,
  targetOptions,
  relationTypeOptions = [],
  relationPropertyByType = {},
  relationTargetInfoByType = {},
  targetPropertyOptions = [],
  onCreateBase,
  onCreateExtended,
  onCreateRelation,
}: UnmappedCardProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ResolveMode>("property");

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
              속성
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
              variant={mode === "property" ? "default" : "outline"}
              size="sm"
              className={cn("h-7 text-xs", mode === "property" && "bg-gray-900 hover:bg-gray-900")}
              onClick={() => setMode("property")}
            >
              속성
            </Button>
            <Button
              type="button"
              variant={mode === "relation" ? "default" : "outline"}
              size="sm"
              className={cn("h-7 text-xs", mode === "relation" && "bg-gray-900 hover:bg-gray-900")}
              onClick={() => setMode("relation")}
            >
              관계 속성
            </Button>
          </div>

          {/* 서브폼 렌더링 */}
          <div className="space-y-3">
            {mode === "property" && (
              <UnmappedBaseForm
                column={column}
                targetOptions={targetOptions}
                onApply={(src, prop) => {
                  onCreateBase(src, prop);
                  setOpen(false);
                }}
                onApplyExtended={(src, propName) => {
                  onCreateExtended(src, propName);
                  setOpen(false);
                }}
              />
            )}

            {mode === "relation" && (
              <UnmappedRelationForm
                column={column}
                relationTypeOptions={relationTypeOptions}
                relationPropertyByType={relationPropertyByType}
                relationTargetInfoByType={relationTargetInfoByType}
                targetPropertyOptions={targetPropertyOptions}
                onApply={(relType, nodeColumns, relColumns, relColumnTypes) => {
                  onCreateRelation(relType, nodeColumns, relColumns, relColumnTypes);
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
