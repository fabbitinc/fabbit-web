import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TargetPropertyOption } from "@/features/onboarding/types/onboarding.types";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import { DisplayWithOriginalTooltip } from "./DisplayWithOriginalTooltip";
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
    { fromColumns: string[]; toColumns: string[]; fromLabel: string; toLabel: string }
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

function toExtendedPropertyName(sourceColumn: string) {
  const hash = Array.from(sourceColumn).reduce(
    (acc, ch) => ((acc * 31 + ch.charCodeAt(0)) >>> 0),
    7,
  );
  const normalizeName = sourceColumn
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `_ext_${normalizeName || `col_${hash.toString(36)}`}`;
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
  const { t } = useTranslation(["mapping"]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ResolveMode>("base");

  const labels = useMemo(
    () => [...new Set(targetOptions.map((opt) => opt.label))].sort((a, b) => a.localeCompare(b)),
    [targetOptions],
  );

  const [baseLabel, setBaseLabel] = useState<string>(labels[0] || "");
  const baseProperties = useMemo(
    () => targetOptions.filter((opt) => opt.label === baseLabel),
    [targetOptions, baseLabel],
  );
  const [baseProperty, setBaseProperty] = useState<string>("");

  const [extendedLabel, setExtendedLabel] = useState<string>(labels[0] || "");
  const [extendedPropertyName, setExtendedPropertyName] = useState<string>(
    toExtendedPropertyName(column),
  );

  const [relationType, setRelationType] = useState<string>(relationTypeOptions[0] || "");
  const effectiveRelationType = relationType || relationTypeOptions[0] || "";
  const relationEndpointOptions = relationEndpointOptionsByType[effectiveRelationType];
  const relationFromOptions = relationEndpointOptions?.fromColumns || relationFromToOptions;
  const relationToOptions = relationEndpointOptions?.toColumns || relationFromToOptions;
  const [relationFrom, setRelationFrom] = useState<string>(relationFromOptions[0] || "");
  const [relationTo, setRelationTo] = useState<string>(relationToOptions[0] || "");
  const effectiveRelationFrom =
    relationFromOptions.includes(relationFrom) ? relationFrom : relationFromOptions[0] || "";
  const effectiveRelationTo =
    relationToOptions.includes(relationTo) ? relationTo : relationToOptions[0] || "";
  const relationProps = effectiveRelationType ? relationPropertyByType[effectiveRelationType] || [] : [];
  const [relationProperty, setRelationProperty] = useState<string>(relationProps[0] || "");
  const effectiveRelationProperty =
    relationProps.includes(relationProperty) ? relationProperty : relationProps[0] || "";

  const canApply =
    mode === "base"
      ? Boolean(baseLabel && baseProperty)
        : mode === "extended"
          ? Boolean(extendedLabel && extendedPropertyName)
        : Boolean(
            effectiveRelationType &&
              effectiveRelationFrom &&
              effectiveRelationTo &&
              effectiveRelationProperty,
          );

  const handleApply = () => {
    if (mode === "base") {
      if (!baseLabel || !baseProperty) return;
      onCreateBase(column, baseLabel, baseProperty);
      setOpen(false);
      return;
    }

    if (mode === "extended") {
      if (!extendedLabel) return;
      onCreateExtended(column, extendedLabel, extendedPropertyName);
      setOpen(false);
      return;
    }

    if (mode === "relation_prop") {
      if (
        !effectiveRelationType ||
        !effectiveRelationFrom ||
        !effectiveRelationTo ||
        !effectiveRelationProperty
      ) {
        return;
      }
      onCreateRelation(
        column,
        effectiveRelationType,
        effectiveRelationFrom,
        effectiveRelationTo,
        effectiveRelationProperty,
      );
      setOpen(false);
    }
  };

  const currentTargetDisplay = "미할당";

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
            <p className="text-[15px] font-bold text-gray-900">{currentTargetDisplay}</p>
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
              onClick={() => {
                setMode("relation_prop");
                const nextType = effectiveRelationType;
                setRelationType(nextType);
                const endpoints = relationEndpointOptionsByType[nextType];
                if (endpoints) {
                  setRelationFrom(endpoints.fromColumns[0] || "");
                  setRelationTo(endpoints.toColumns[0] || "");
                }
                if (!effectiveRelationProperty && nextType) {
                  setRelationProperty((relationPropertyByType[nextType] || [""])[0]);
                }
              }}
            >
              관계 속성
            </Button>
          </div>

          <div className="space-y-3">
            {mode === "base" && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">라벨</Label>
                  <Select
                    value={baseLabel}
                    onValueChange={(value) => {
                      setBaseLabel(value);
                      const next = targetOptions.find((opt) => opt.label === value)?.property || "";
                      setBaseProperty(next);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="라벨 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {labels.map((label) => (
                        <SelectItem key={label} value={label}>
                          <DisplayWithOriginalTooltip
                            display={t(`mapping:nodeLabel.${label}`, label)}
                            original={label}
                          />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">속성</Label>
                  <Select value={baseProperty} onValueChange={setBaseProperty}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="속성 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {baseProperties.map((prop) => (
                        <SelectItem key={`${prop.label}.${prop.property}`} value={prop.property}>
                          <DisplayWithOriginalTooltip
                            display={t(`mapping:property.${prop.property}`, prop.property)}
                            original={prop.property}
                          />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {mode === "extended" && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">라벨</Label>
                  <Select value={extendedLabel} onValueChange={setExtendedLabel}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="라벨 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {labels.map((label) => (
                        <SelectItem key={label} value={label}>
                          <DisplayWithOriginalTooltip
                            display={t(`mapping:nodeLabel.${label}`, label)}
                            original={label}
                          />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">속성</Label>
                  <Input
                    className="h-9 text-xs"
                    value={extendedPropertyName}
                    onChange={(e) => setExtendedPropertyName(e.target.value)}
                  />
                </div>
              </>
            )}

            {mode === "relation_prop" && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">타입</Label>
                  <Select
                    value={effectiveRelationType}
                    onValueChange={(value) => {
                      setRelationType(value);
                      const endpoints = relationEndpointOptionsByType[value];
                      if (endpoints) {
                        setRelationFrom(endpoints.fromColumns[0] || "");
                        setRelationTo(endpoints.toColumns[0] || "");
                      }
                      setRelationProperty((relationPropertyByType[value] || [""])[0]);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="관계 타입" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">원본 기준 컬럼</Label>
                    <Select value={effectiveRelationFrom} onValueChange={setRelationFrom}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="원본 기준 컬럼" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationFromOptions.map((col) => (
                          <SelectItem key={`from-${col}`} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">대상 기준 컬럼</Label>
                    <Select value={effectiveRelationTo} onValueChange={setRelationTo}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="대상 기준 컬럼" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationToOptions.map((col) => (
                          <SelectItem key={`to-${col}`} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">속성</Label>
                  <Select value={effectiveRelationProperty} onValueChange={setRelationProperty}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="관계 속성" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationProps.map((prop) => (
                        <SelectItem key={prop} value={prop}>
                          <DisplayWithOriginalTooltip
                            display={t(`mapping:property.${prop}`, prop)}
                            original={prop}
                          />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {relationProps.length === 0 && (
                  <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    선택한 관계 타입에 설정 가능한 관계 속성이 없습니다.
                  </div>
                )}
              </>
            )}

            <p className="text-sm text-gray-500">선택 컬럼: {column}</p>

            <Button
              type="button"
              size="sm"
              className="h-8 w-full bg-gray-900 text-xs hover:bg-gray-800"
              disabled={!canApply}
              onClick={handleApply}
            >
              적용
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
