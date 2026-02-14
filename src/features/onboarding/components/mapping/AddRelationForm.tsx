import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMappingStore } from "@/stores/onboarding";
import { DisplayWithOriginalTooltip } from "./DisplayWithOriginalTooltip";

const NO_PROPERTY = "__NONE__";

interface AddRelationFormProps {
  relationTypeOptions: string[];
  relationPropertyByType: Record<string, string[]>;
  relationEndpointOptionsByType: Record<
    string,
    { fromColumns: string[]; toColumns: string[]; fromLabel: string; toLabel: string; fromMergeKey?: string; toMergeKey?: string }
  >;
  unmappedColumns: string[];
  onApply: (
    sourceColumn: string,
    relType: string,
    fromSourceColumn: string,
    toSourceColumn: string,
    relationProperty: string,
  ) => void;
}

export function AddRelationForm({
  relationTypeOptions,
  relationPropertyByType,
  relationEndpointOptionsByType,
  unmappedColumns,
  onApply,
}: AddRelationFormProps) {
  const { t } = useTranslation(["mapping"]);
  const editableConstraints = useMappingStore((s) => s.editableConstraints);

  const [isOpen, setIsOpen] = useState(false);

  const propertyRequiredMap = useMemo(() => {
    const catalog = editableConstraints?.relation_property_catalog || [];
    const map: Record<string, boolean> = {};
    catalog.forEach((item) => {
      map[`${item.rel_type}:${item.property}`] = item.required;
    });
    return map;
  }, [editableConstraints]);

  const [relationType, setRelationType] = useState<string>(relationTypeOptions[0] || "");
  const effectiveRelationType = relationType || relationTypeOptions[0] || "";
  const relationEndpointOptions = relationEndpointOptionsByType[effectiveRelationType];
  const relationFromOptions = relationEndpointOptions?.fromColumns || [];
  const relationToOptions = relationEndpointOptions?.toColumns || [];
  const [relationFrom, setRelationFrom] = useState<string>(relationFromOptions[0] || "");
  const [relationTo, setRelationTo] = useState<string>(relationToOptions[0] || "");
  const effectiveRelationFrom =
    relationFromOptions.includes(relationFrom) ? relationFrom : relationFromOptions[0] || "";
  const effectiveRelationTo =
    relationToOptions.includes(relationTo) ? relationTo : relationToOptions[0] || "";

  const relationProps = effectiveRelationType
    ? relationPropertyByType[effectiveRelationType] || []
    : [];
  const [relationProperty, setRelationProperty] = useState<string>(NO_PROPERTY);
  const effectiveRelationProperty =
    relationProperty !== NO_PROPERTY && relationProps.includes(relationProperty)
      ? relationProperty
      : NO_PROPERTY;
  const hasPropertySelected = effectiveRelationProperty !== NO_PROPERTY;

  const [sourceColumn, setSourceColumn] = useState<string>("");
  const effectiveSourceColumn =
    unmappedColumns.includes(sourceColumn) ? sourceColumn : "";

  const hasProperties = relationProps.length > 0;
  const isSameEndpoint = effectiveRelationFrom !== "" && effectiveRelationFrom === effectiveRelationTo;

  const canApply = Boolean(
    effectiveRelationType &&
      effectiveRelationFrom &&
      effectiveRelationTo &&
      !isSameEndpoint &&
      (!hasPropertySelected || effectiveSourceColumn),
  );

  const resetForm = () => {
    setRelationType(relationTypeOptions[0] || "");
    setRelationFrom("");
    setRelationTo("");
    setRelationProperty(NO_PROPERTY);
    setSourceColumn("");
  };

  const handleApply = () => {
    if (!canApply) return;
    onApply(
      hasPropertySelected ? effectiveSourceColumn : "",
      effectiveRelationType,
      effectiveRelationFrom,
      effectiveRelationTo,
      hasPropertySelected ? effectiveRelationProperty : "",
    );
    resetForm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  if (relationTypeOptions.length === 0) return null;

  if (!isOpen) {
    return (
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 px-4 py-3 text-sm font-medium text-violet-500 transition-colors hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-600"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-4" />
        관계 추가
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/30 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-violet-600">관계 추가</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-gray-600"
          onClick={handleCancel}
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* 타입 */}
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
            setRelationProperty(NO_PROPERTY);
            setSourceColumn("");
          }}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="관계 타입" />
          </SelectTrigger>
          <SelectContent>
            {relationTypeOptions.map((type) => (
              <SelectItem key={type} value={type}>
                <DisplayWithOriginalTooltip
                  display={t(`mapping:relType.${type}`, type)}
                  original={type}
                />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* From / To */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="inline-flex items-center gap-1.5 text-xs text-gray-600">
            <span>원본 기준 컬럼</span>
            {relationEndpointOptions?.fromLabel && (
              <span className="inline-flex items-center rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-semibold text-violet-700">
                <DisplayWithOriginalTooltip
                  display={t(`mapping:nodeLabel.${relationEndpointOptions.fromLabel}`, relationEndpointOptions.fromLabel)}
                  original={relationEndpointOptions.fromLabel}
                />
              </span>
            )}
          </Label>
          <Select value={effectiveRelationFrom} onValueChange={setRelationFrom}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="원본 기준 컬럼" />
            </SelectTrigger>
            <SelectContent>
              {relationFromOptions.map((col) => (
                <SelectItem key={`from-${col}`} value={col}>
                  <DisplayWithOriginalTooltip
                    display={col}
                    original={relationEndpointOptions?.fromMergeKey ? t(`mapping:property.${relationEndpointOptions.fromMergeKey}`, relationEndpointOptions.fromMergeKey) : undefined}
                  />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="inline-flex items-center gap-1.5 text-xs text-gray-600">
            <span>대상 기준 컬럼</span>
            {relationEndpointOptions?.toLabel && (
              <span className="inline-flex items-center rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-semibold text-violet-700">
                <DisplayWithOriginalTooltip
                  display={t(`mapping:nodeLabel.${relationEndpointOptions.toLabel}`, relationEndpointOptions.toLabel)}
                  original={relationEndpointOptions.toLabel}
                />
              </span>
            )}
          </Label>
          <Select value={effectiveRelationTo} onValueChange={setRelationTo}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="대상 기준 컬럼" />
            </SelectTrigger>
            <SelectContent>
              {relationToOptions.map((col) => (
                <SelectItem key={`to-${col}`} value={col}>
                  <DisplayWithOriginalTooltip
                    display={col}
                    original={relationEndpointOptions?.toMergeKey ? t(`mapping:property.${relationEndpointOptions.toMergeKey}`, relationEndpointOptions.toMergeKey) : undefined}
                  />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isSameEndpoint && (
        <p className="text-xs text-red-500">원본 기준 컬럼과 대상 기준 컬럼은 서로 다른 컬럼이어야 합니다.</p>
      )}

      {/* 속성 (선택) */}
      {hasProperties && (
        <div className="space-y-1">
          <Label className="text-xs text-gray-600">속성 (선택)</Label>
          <Select
            value={effectiveRelationProperty}
            onValueChange={(value) => {
              setRelationProperty(value);
              if (value === NO_PROPERTY) setSourceColumn("");
            }}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="관계 속성" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PROPERTY}>
                <span className="text-gray-400">없음 (관계만 생성)</span>
              </SelectItem>
              {relationProps.map((prop) => {
                const isRequired = propertyRequiredMap[`${effectiveRelationType}:${prop}`] ?? false;
                return (
                  <SelectItem key={prop} value={prop}>
                    <DisplayWithOriginalTooltip
                      display={`${t(`mapping:property.${prop}`, prop)}${isRequired ? " *" : ""}`}
                      original={prop}
                    />
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 원본 컬럼 (속성 선택 시) */}
      {hasPropertySelected && (
        <div className="space-y-1">
          <Label className="text-xs text-gray-600">원본 컬럼</Label>
          {unmappedColumns.length > 0 ? (
            <Select value={effectiveSourceColumn} onValueChange={setSourceColumn}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="매핑할 원본 컬럼 선택" />
              </SelectTrigger>
              <SelectContent>
                {unmappedColumns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="py-1 text-xs text-amber-600">
              모든 원본 컬럼이 매핑되어 있어 선택할 수 없습니다. 속성 없이 관계만 생성하려면 속성을 "없음"으로 변경하세요.
            </p>
          )}
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          className="h-8 flex-1 bg-violet-600 text-xs hover:bg-violet-700"
          disabled={!canApply}
          onClick={handleApply}
        >
          적용
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={handleCancel}
        >
          취소
        </Button>
      </div>
    </div>
  );
}
