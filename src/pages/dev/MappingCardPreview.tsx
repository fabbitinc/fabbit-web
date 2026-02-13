import { useTranslation } from "react-i18next";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";
import {
  mockColumnMappings,
  mockRelationMappings,
  mockMappingSampleRows,
} from "@/features/onboarding/mock-data/onboarding-mock";
import { getConfidenceLevel } from "@/features/onboarding/types/onboarding.types";
import type {
  ColumnMappingEntry,
  RelationMappingEntry,
  ConfidenceLevel,
} from "@/features/onboarding/types/onboarding.types";
import { cn, withOriginal } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── 공통 ───

const getSampleData = (column: string) => {
  const unique = [...new Set(mockMappingSampleRows.map((row) => row[column]).filter(Boolean))];
  return unique.slice(0, 3);
};

const labelBg: Record<string, string> = {
  Part: "bg-blue-50 text-blue-700 ring-blue-200/60",
  Supplier: "bg-violet-50 text-violet-700 ring-violet-200/60",
  Drawing: "bg-slate-50 text-slate-600 ring-slate-200/60",
  Project: "bg-teal-50 text-teal-700 ring-teal-200/60",
};

const confDot: Record<ConfidenceLevel, string> = {
  high: "bg-emerald-400",
  medium: "bg-amber-400",
  low: "bg-red-400",
};

const confText: Record<ConfidenceLevel, string> = {
  high: "text-emerald-600",
  medium: "text-amber-600",
  low: "text-red-600",
};

const columnData = mockColumnMappings;
const relationData = mockRelationMappings;

// ═══════════════════════════════════════════════════
// A-1. 통합 뱃지: 레이블·속성을 하나의 뱃지로 묶음
//      [부품 (Part) · 명칭 (name)]
// ═══════════════════════════════════════════════════

function A1ColumnMapping({ data }: { data: ColumnMappingEntry[] }) {
  const { t } = useTranslation(["common", "mapping"]);

  return (
    <div className="space-y-3">
      {data.map((cm) => {
        const level = getConfidenceLevel(cm.confidence);
        const localLabel = t(`mapping:nodeLabel.${cm.target_label}`, cm.target_label);
        const localProp = t(`mapping:property.${cm.target_property}`, cm.target_property);
        const localType = t(`common:dataType.${cm.data_type}`, cm.data_type);
        const sample = getSampleData(cm.source_column);

        return (
          <div
            key={cm.id}
            className={cn(
              "rounded-xl border px-5 py-4",
              cm.approved ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 bg-white"
            )}
          >
            {/* 1행: 매핑 흐름 */}
            <div className="mb-3 grid grid-cols-[140px_16px_1fr] items-center gap-3">
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">원본</div>
                <div className="truncate text-[15px] font-bold text-gray-900" title={cm.source_column}>{cm.source_column}</div>
              </div>
              <ChevronRight className="mt-3 size-4 text-gray-300" />
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">타겟</div>
                <span className={cn(
                  "inline-flex items-baseline gap-1 rounded-lg px-2.5 py-1 ring-1 ring-inset",
                  labelBg[cm.target_label] || "bg-gray-50 text-gray-600 ring-gray-200/60"
                )}>
                  <span className="text-[11px] font-medium opacity-60">{withOriginal(localLabel, cm.target_label)}</span>
                  <span className="text-[10px] opacity-30">/</span>
                  <span className="text-sm font-bold">{withOriginal(localProp, cm.target_property)}</span>
                </span>
              </div>
            </div>

            {/* 2행: 메타 + 액션 */}
            <div className="grid grid-cols-[minmax(140px,1fr)_100px_80px_auto] items-center gap-4 border-t border-gray-100 pt-3">
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">샘플 데이터</div>
                <div className="truncate text-sm text-gray-500" title={sample.join(", ")}>{sample.join(", ")}</div>
              </div>
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">데이터 타입</div>
                <div className="text-sm text-gray-600">{withOriginal(localType, cm.data_type)}</div>
              </div>
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">신뢰도</div>
                <div className="flex items-center gap-1">
                  <span className={cn("size-2 rounded-full", confDot[level])} />
                  <span className={cn("text-sm font-semibold tabular-nums", confText[level])}>{cm.confidence}%</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <div className="flex w-[134px] items-center justify-end gap-1.5">
                  {cm.approved ? (
                    <>
                      <span className="w-16" />
                      <span className="inline-flex w-16 items-center justify-center gap-1 rounded-full bg-emerald-100 py-1 text-xs font-semibold text-emerald-700">
                        <Check className="size-3.5" /> {t("common:approved")}
                      </span>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="h-7 w-16 justify-center px-0 text-xs">
                        {t("common:change")} <ChevronDown className="ml-0.5 size-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-16 justify-center border-emerald-200 px-0 text-xs text-emerald-700 hover:bg-emerald-50">
                        <Check className="mr-1 size-3.5" /> {t("common:approve")}
                      </Button>
                    </>
                  )}
                </div>
                <button className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500">
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function A1RelationMapping({ data }: { data: RelationMappingEntry[] }) {
  const { t } = useTranslation(["common", "mapping"]);

  return (
    <div className="space-y-3">
      {data.map((rm) => {
        const localFrom = t(`mapping:nodeLabel.${rm.from_label}`, rm.from_label);
        const localTo = t(`mapping:nodeLabel.${rm.to_label}`, rm.to_label);
        const localRel = t(`mapping:relType.${rm.rel_type}`, rm.rel_type);
        const fromCols = Object.values(rm.from_columns).join(", ");
        const toCols = Object.values(rm.to_columns).join(", ");
        const propEntries = Object.entries(rm.properties);

        return (
          <div
            key={rm.id}
            className={cn(
              "rounded-xl border px-5 py-4",
              rm.approved ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 bg-white"
            )}
          >
            {/* 1행: 매핑 컬럼 + 속성 */}
            <div className="mb-3 grid grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)] items-end gap-4">
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">매핑 컬럼</div>
                <div className="text-[15px] font-bold text-gray-900">{fromCols} → {toCols}</div>
              </div>
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">속성</div>
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
                <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset", labelBg[rm.from_label] || "bg-gray-50 text-gray-600 ring-gray-200/60")}>
                  {withOriginal(localFrom, rm.from_label)}
                </span>
                <ChevronRight className="size-4 text-gray-300" />
                <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-bold text-violet-700">
                  {withOriginal(localRel, rm.rel_type)}
                </span>
                <ChevronRight className="size-4 text-gray-300" />
                <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset", labelBg[rm.to_label] || "bg-gray-50 text-gray-600 ring-gray-200/60")}>
                  {withOriginal(localTo, rm.to_label)}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <div className="w-16">
                  {rm.approved ? (
                    <span className="inline-flex w-full items-center justify-center gap-1 rounded-full bg-emerald-100 py-1 text-xs font-semibold text-emerald-700">
                      <Check className="size-3.5" /> {t("common:approved")}
                    </span>
                  ) : (
                    <Button variant="outline" size="sm" className="h-7 w-full justify-center border-emerald-200 px-0 text-xs text-emerald-700 hover:bg-emerald-50">
                      <Check className="mr-1 size-3.5" /> {t("common:approve")}
                    </Button>
                  )}
                </div>
                <button className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500">
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// A-2. 세그먼트 필: 레이블 | 속성 을 이어붙인 2단 필
//      [부품 (Part) | 명칭 (name)]
// ═══════════════════════════════════════════════════

const labelSegLeft: Record<string, string> = {
  Part: "bg-blue-100 text-blue-700",
  Supplier: "bg-violet-100 text-violet-700",
  Drawing: "bg-slate-100 text-slate-600",
  Project: "bg-teal-100 text-teal-700",
};

const labelSegRight: Record<string, string> = {
  Part: "bg-blue-50 text-blue-800",
  Supplier: "bg-violet-50 text-violet-800",
  Drawing: "bg-slate-50 text-slate-700",
  Project: "bg-teal-50 text-teal-800",
};

const labelSegRing: Record<string, string> = {
  Part: "ring-blue-200/60",
  Supplier: "ring-violet-200/60",
  Drawing: "ring-slate-200/60",
  Project: "ring-teal-200/60",
};

function A2ColumnMapping({ data }: { data: ColumnMappingEntry[] }) {
  const { t } = useTranslation(["common", "mapping"]);

  return (
    <div className="space-y-3">
      {data.map((cm) => {
        const level = getConfidenceLevel(cm.confidence);
        const localLabel = t(`mapping:nodeLabel.${cm.target_label}`, cm.target_label);
        const localProp = t(`mapping:property.${cm.target_property}`, cm.target_property);
        const localType = t(`common:dataType.${cm.data_type}`, cm.data_type);
        const sample = getSampleData(cm.source_column);

        return (
          <div
            key={cm.id}
            className={cn(
              "rounded-xl border px-5 py-4",
              cm.approved ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 bg-white"
            )}
          >
            {/* 1행: 매핑 흐름 */}
            <div className="mb-3 flex items-center gap-3">
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">원본</div>
                <div className="text-[15px] font-bold text-gray-900">{cm.source_column}</div>
              </div>
              <ChevronRight className="mt-3 size-4 shrink-0 text-gray-300" />
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">타겟</div>
                <span className={cn("inline-flex overflow-hidden rounded-lg ring-1 ring-inset", labelSegRing[cm.target_label] || "ring-gray-200/60")}>
                  <span className={cn("px-2 py-1 text-xs font-semibold", labelSegLeft[cm.target_label] || "bg-gray-100 text-gray-600")}>
                    {withOriginal(localLabel, cm.target_label)}
                  </span>
                  <span className={cn("px-2.5 py-1 text-sm font-semibold", labelSegRight[cm.target_label] || "bg-gray-50 text-gray-700")}>
                    {withOriginal(localProp, cm.target_property)}
                  </span>
                </span>
              </div>
            </div>

            {/* 2행: 메타 + 액션 */}
            <div className="grid grid-cols-[minmax(140px,1fr)_100px_80px_auto] items-center gap-4 border-t border-gray-100 pt-3">
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">샘플 데이터</div>
                <div className="truncate text-sm text-gray-500" title={sample.join(", ")}>{sample.join(", ")}</div>
              </div>
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">데이터 타입</div>
                <div className="text-sm text-gray-600">{withOriginal(localType, cm.data_type)}</div>
              </div>
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">신뢰도</div>
                <div className="flex items-center gap-1">
                  <span className={cn("size-2 rounded-full", confDot[level])} />
                  <span className={cn("text-sm font-semibold tabular-nums", confText[level])}>{cm.confidence}%</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <div className="flex w-[134px] items-center justify-end gap-1.5">
                  {cm.approved ? (
                    <>
                      <span className="w-16" />
                      <span className="inline-flex w-16 items-center justify-center gap-1 rounded-full bg-emerald-100 py-1 text-xs font-semibold text-emerald-700">
                        <Check className="size-3.5" /> {t("common:approved")}
                      </span>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="h-7 w-16 justify-center px-0 text-xs">
                        {t("common:change")} <ChevronDown className="ml-0.5 size-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-16 justify-center border-emerald-200 px-0 text-xs text-emerald-700 hover:bg-emerald-50">
                        <Check className="mr-1 size-3.5" /> {t("common:approve")}
                      </Button>
                    </>
                  )}
                </div>
                <button className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500">
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function A2RelationMapping({ data }: { data: RelationMappingEntry[] }) {
  const { t } = useTranslation(["common", "mapping"]);

  return (
    <div className="space-y-3">
      {data.map((rm) => {
        const localFrom = t(`mapping:nodeLabel.${rm.from_label}`, rm.from_label);
        const localTo = t(`mapping:nodeLabel.${rm.to_label}`, rm.to_label);
        const localRel = t(`mapping:relType.${rm.rel_type}`, rm.rel_type);
        const fromCols = Object.values(rm.from_columns).join(", ");
        const toCols = Object.values(rm.to_columns).join(", ");
        const propEntries = Object.entries(rm.properties);

        return (
          <div
            key={rm.id}
            className={cn(
              "rounded-xl border px-5 py-4",
              rm.approved ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 bg-white"
            )}
          >
            <div className="mb-3">
              <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">관계</div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset", labelBg[rm.from_label] || "bg-gray-50 text-gray-600 ring-gray-200/60")}>
                  {withOriginal(localFrom, rm.from_label)}
                </span>
                <ChevronRight className="size-4 text-gray-300" />
                <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-bold text-violet-700">
                  {withOriginal(localRel, rm.rel_type)}
                </span>
                <ChevronRight className="size-4 text-gray-300" />
                <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset", labelBg[rm.to_label] || "bg-gray-50 text-gray-600 ring-gray-200/60")}>
                  {withOriginal(localTo, rm.to_label)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)_auto] items-center gap-4 border-t border-gray-100 pt-3">
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">매핑 컬럼</div>
                <div className="text-sm text-gray-600">{fromCols} → {toCols}</div>
              </div>
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">속성</div>
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
              <div className="flex items-center justify-end gap-1.5">
                {rm.approved ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <Check className="size-3.5" /> {t("common:approved")}
                  </span>
                ) : (
                  <Button variant="outline" size="sm" className="h-7 w-16 justify-center border-emerald-200 px-0 text-xs text-emerald-700 hover:bg-emerald-50">
                    <Check className="mr-1 size-3.5" /> {t("common:approve")}
                  </Button>
                )}
                <button className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500">
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// A-3. 도트 표기: 레이블.속성을 텍스트로, 레이블만 색상
//      부품 (Part).명칭 (name) — 점 앞뒤 모두 동일 크기
// ═══════════════════════════════════════════════════

const labelTextColor: Record<string, string> = {
  Part: "text-blue-600",
  Supplier: "text-violet-600",
  Drawing: "text-slate-500",
  Project: "text-teal-600",
};

function A3ColumnMapping({ data }: { data: ColumnMappingEntry[] }) {
  const { t } = useTranslation(["common", "mapping"]);

  return (
    <div className="space-y-3">
      {data.map((cm) => {
        const level = getConfidenceLevel(cm.confidence);
        const localLabel = t(`mapping:nodeLabel.${cm.target_label}`, cm.target_label);
        const localProp = t(`mapping:property.${cm.target_property}`, cm.target_property);
        const localType = t(`common:dataType.${cm.data_type}`, cm.data_type);
        const sample = getSampleData(cm.source_column);

        return (
          <div
            key={cm.id}
            className={cn(
              "rounded-xl border px-5 py-4",
              cm.approved ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 bg-white"
            )}
          >
            {/* 1행: 매핑 흐름 */}
            <div className="mb-3 flex items-center gap-3">
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">원본</div>
                <div className="text-[15px] font-bold text-gray-900">{cm.source_column}</div>
              </div>
              <ChevronRight className="mt-3 size-4 shrink-0 text-gray-300" />
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">타겟</div>
                <div className="text-[15px] font-semibold">
                  <span className={labelTextColor[cm.target_label] || "text-gray-600"}>
                    {withOriginal(localLabel, cm.target_label)}
                  </span>
                  <span className="text-gray-300">.</span>
                  <span className="text-gray-800">
                    {withOriginal(localProp, cm.target_property)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2행: 메타 + 액션 */}
            <div className="grid grid-cols-[minmax(140px,1fr)_100px_80px_auto] items-center gap-4 border-t border-gray-100 pt-3">
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">샘플 데이터</div>
                <div className="truncate text-sm text-gray-500" title={sample.join(", ")}>{sample.join(", ")}</div>
              </div>
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">데이터 타입</div>
                <div className="text-sm text-gray-600">{withOriginal(localType, cm.data_type)}</div>
              </div>
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">신뢰도</div>
                <div className="flex items-center gap-1">
                  <span className={cn("size-2 rounded-full", confDot[level])} />
                  <span className={cn("text-sm font-semibold tabular-nums", confText[level])}>{cm.confidence}%</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <div className="flex w-[134px] items-center justify-end gap-1.5">
                  {cm.approved ? (
                    <>
                      <span className="w-16" />
                      <span className="inline-flex w-16 items-center justify-center gap-1 rounded-full bg-emerald-100 py-1 text-xs font-semibold text-emerald-700">
                        <Check className="size-3.5" /> {t("common:approved")}
                      </span>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="h-7 w-16 justify-center px-0 text-xs">
                        {t("common:change")} <ChevronDown className="ml-0.5 size-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-16 justify-center border-emerald-200 px-0 text-xs text-emerald-700 hover:bg-emerald-50">
                        <Check className="mr-1 size-3.5" /> {t("common:approve")}
                      </Button>
                    </>
                  )}
                </div>
                <button className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500">
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function A3RelationMapping({ data }: { data: RelationMappingEntry[] }) {
  const { t } = useTranslation(["common", "mapping"]);

  return (
    <div className="space-y-3">
      {data.map((rm) => {
        const localFrom = t(`mapping:nodeLabel.${rm.from_label}`, rm.from_label);
        const localTo = t(`mapping:nodeLabel.${rm.to_label}`, rm.to_label);
        const localRel = t(`mapping:relType.${rm.rel_type}`, rm.rel_type);
        const fromCols = Object.values(rm.from_columns).join(", ");
        const toCols = Object.values(rm.to_columns).join(", ");
        const propEntries = Object.entries(rm.properties);

        return (
          <div
            key={rm.id}
            className={cn(
              "rounded-xl border px-5 py-4",
              rm.approved ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 bg-white"
            )}
          >
            <div className="mb-3">
              <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">관계</div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset", labelBg[rm.from_label] || "bg-gray-50 text-gray-600 ring-gray-200/60")}>
                  {withOriginal(localFrom, rm.from_label)}
                </span>
                <ChevronRight className="size-4 text-gray-300" />
                <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-bold text-violet-700">
                  {withOriginal(localRel, rm.rel_type)}
                </span>
                <ChevronRight className="size-4 text-gray-300" />
                <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset", labelBg[rm.to_label] || "bg-gray-50 text-gray-600 ring-gray-200/60")}>
                  {withOriginal(localTo, rm.to_label)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)_auto] items-center gap-4 border-t border-gray-100 pt-3">
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">매핑 컬럼</div>
                <div className="text-sm text-gray-600">{fromCols} → {toCols}</div>
              </div>
              <div>
                <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">속성</div>
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
              <div className="flex items-center justify-end gap-1.5">
                {rm.approved ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <Check className="size-3.5" /> {t("common:approved")}
                  </span>
                ) : (
                  <Button variant="outline" size="sm" className="h-7 w-16 justify-center border-emerald-200 px-0 text-xs text-emerald-700 hover:bg-emerald-50">
                    <Check className="mr-1 size-3.5" /> {t("common:approve")}
                  </Button>
                )}
                <button className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500">
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 메인 프리뷰 페이지
// ═══════════════════════════════════════════════════

export function MappingCardPreview() {
  return (
    <div className="min-h-screen bg-gray-50/80 px-6 py-12">
      <div className="mx-auto max-w-[1100px] space-y-20">
        {/* 타이틀 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">A안 타겟 표기 개선 비교</h1>
          <p className="mt-2 text-sm text-gray-500">2행 grid 분리 기반 — 타겟 레이블·속성 표기 3가지 변형</p>
        </div>

        {/* ─── A-1. 통합 뱃지 ─── */}
        <section className="space-y-6">
          <div className="flex items-baseline gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">1</span>
            <h2 className="text-xl font-bold text-gray-900">통합 뱃지</h2>
            <span className="text-sm text-gray-400">— 레이블·속성을 하나의 큰 뱃지로 묶음</span>
          </div>
          <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-4">
            <code className="text-xs text-gray-500">
              [부품 (Part) · 명칭 (name)]  — 같은 배경색, 중간점으로 구분
            </code>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600">컬럼 매핑</h3>
            <A1ColumnMapping data={columnData} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-600">관계 매핑</h3>
            <A1RelationMapping data={relationData} />
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* ─── A-2. 세그먼트 필 ─── */}
        <section className="space-y-6">
          <div className="flex items-baseline gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">2</span>
            <h2 className="text-xl font-bold text-gray-900">세그먼트 필</h2>
            <span className="text-sm text-gray-400">— 레이블(진한) | 속성(연한) 2단 필 형태</span>
          </div>
          <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-4">
            <code className="text-xs text-gray-500">
              [부품 (Part) | 명칭 (name)]  — 왼쪽 진한 배경, 오른쪽 연한 배경, 이어붙인 필
            </code>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600">컬럼 매핑</h3>
            <A2ColumnMapping data={columnData} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-600">관계 매핑</h3>
            <A2RelationMapping data={relationData} />
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* ─── A-3. 도트 표기 ─── */}
        <section className="space-y-6">
          <div className="flex items-baseline gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">3</span>
            <h2 className="text-xl font-bold text-gray-900">도트 표기</h2>
            <span className="text-sm text-gray-400">— 뱃지 없이 텍스트로 레이블.속성, 레이블에 색상</span>
          </div>
          <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-4">
            <code className="text-xs text-gray-500">
              <span className="text-blue-600">부품 (Part)</span><span className="text-gray-300">.</span><span className="text-gray-800">명칭 (name)</span>  — 뱃지 없이, 레이블만 색상 텍스트
            </code>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600">컬럼 매핑</h3>
            <A3ColumnMapping data={columnData} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-600">관계 매핑</h3>
            <A3RelationMapping data={relationData} />
          </div>
        </section>

        <div className="h-20" />
      </div>
    </div>
  );
}
