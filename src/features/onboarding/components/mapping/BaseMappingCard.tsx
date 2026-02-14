import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import { cn } from "@/lib/utils";
import { DisplayWithOriginalTooltip } from "./DisplayWithOriginalTooltip";

interface BaseMappingCardProps {
  /** 1행 좌측: 원본 컬럼명 */
  sourceColumn: string;
  /** 1행 우측 라벨: "라벨 / 속성" 등 */
  targetLabel: string;
  /** 1행 우측 표시값 (번역) */
  targetDisplay: string;
  /** 1행 우측 원본값 (툴팁) */
  targetOriginal: string;

  /** 2행 (관계 전용, 없으면 숨김) */
  relationRow?: {
    endpointLabel: string;
    endpointText: string;
    endpointTitle: string;
    flowDisplay: string;
    flowOriginal: string;
  };

  /** 3행: 샘플 데이터 */
  sampleData: string[];
  /** 3행: 데이터 타입 (번역) */
  dataType: string;
  /** 3행: 데이터 타입 원본 (툴팁) */
  dataTypeOriginal?: string;
  /** 3행: 신뢰도 텍스트 (예: "95%", "-") */
  confidence: string;
  /** 3행: 신뢰도 hover 사유 */
  confidenceReason?: string;

  /** 승인 상태 */
  approved: boolean;
  /** 제외 상태 (관계 전용) */
  dismissed?: boolean;
  /** 제외 사유 텍스트 */
  dismissedReason?: string;

  onApprove: () => void;
  onRemove: () => void;
}

export function BaseMappingCard({
  sourceColumn,
  targetLabel,
  targetDisplay,
  targetOriginal,
  relationRow,
  sampleData,
  dataType,
  dataTypeOriginal,
  confidence,
  confidenceReason,
  approved,
  dismissed,
  dismissedReason,
  onApprove,
  onRemove,
}: BaseMappingCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-5 py-4 transition-all",
        dismissed
          ? "border-gray-200 bg-gray-50/60 opacity-70"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
      )}
    >
      {/* 1행: 원본 컬럼 > 타겟 */}
      <div className="mb-3 grid grid-cols-[140px_16px_1fr] items-center gap-3">
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {MAPPING_TERMS.sourceColumn}
          </div>
          <div className="truncate text-[15px] font-bold text-gray-900" title={sourceColumn}>
            {sourceColumn || "—"}
          </div>
        </div>
        <ChevronRight className="mt-3 size-4 text-gray-300" />
        <div>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {targetLabel}
          </div>
          <p className="text-[15px] font-bold text-gray-900">
            <DisplayWithOriginalTooltip display={targetDisplay} original={targetOriginal} />
          </p>
        </div>
      </div>

      {/* 2행(옵션) + 3행: 단일 grid로 컬럼 정렬 공유 */}
      <div className="grid grid-cols-[minmax(140px,1fr)_100px_80px_auto] items-center gap-x-4 border-t border-gray-100 pt-3">
        {/* 2행: 관계 전용 (옵션) */}
        {relationRow && (
          <>
            <div className="min-w-0 pb-3">
              <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {relationRow.endpointLabel}
              </div>
              <div className="truncate text-sm font-semibold text-gray-700" title={relationRow.endpointTitle}>
                {relationRow.endpointText}
              </div>
            </div>
            <div className="col-span-3 pb-3">
              <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                관계 흐름
              </div>
              <p className="text-sm font-semibold text-gray-700">
                <DisplayWithOriginalTooltip display={relationRow.flowDisplay} original={relationRow.flowOriginal} />
              </p>
            </div>
            {/* 구분선 */}
            <div className="col-span-4 border-t border-gray-100" />
          </>
        )}

        {/* 3행: 샘플 데이터 | 데이터 타입 | 신뢰도 | 버튼 */}
        <div className={cn("min-w-0", relationRow && "pt-3")}>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            샘플 데이터
          </div>
          <div className="truncate text-sm text-gray-500" title={sampleData.join(", ")}>
            {sampleData.length > 0 ? sampleData.join(", ") : "—"}
          </div>
        </div>
        <div className={cn(relationRow && "pt-3")}>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            데이터 타입
          </div>
          <div className="text-sm font-semibold text-gray-700">
            <DisplayWithOriginalTooltip display={dataType} original={dataTypeOriginal} />
          </div>
        </div>
        <div className={cn(relationRow && "pt-3")}>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            신뢰도
          </div>
          <div className="text-sm font-semibold tabular-nums text-gray-700" title={confidenceReason}>
            {confidence}
          </div>
        </div>
        <div className={cn("flex items-center justify-end gap-1.5", relationRow && "pt-3")}>
          {approved ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
              할당됨
            </Badge>
          ) : (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onApprove}>
              할당
            </Button>
          )}
          {!dismissed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-300 hover:bg-red-50 hover:text-red-500"
              onClick={onRemove}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {dismissed && dismissedReason && (
        <div className="mt-2 text-xs text-amber-700">제외 사유: {dismissedReason}</div>
      )}
    </div>
  );
}
