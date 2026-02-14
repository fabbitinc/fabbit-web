import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

interface UnmappedRelationFormProps {
  column: string;
  relationTypeOptions: string[];
  relationPropertyByType: Record<string, string[]>;
  relationFromToOptions: string[];
  relationEndpointOptionsByType: Record<
    string,
    { fromColumns: string[]; toColumns: string[]; fromLabel: string; toLabel: string; fromMergeKey?: string; toMergeKey?: string }
  >;
  onApply: (
    sourceColumn: string,
    relType: string,
    fromSourceColumn: string,
    toSourceColumn: string,
    relationProperty: string,
  ) => void;
}

export function UnmappedRelationForm({
  column,
  relationTypeOptions,
  relationPropertyByType,
  relationFromToOptions,
  relationEndpointOptionsByType,
  onApply,
}: UnmappedRelationFormProps) {
  const { t } = useTranslation(["mapping"]);
  const editableConstraints = useMappingStore((s) => s.editableConstraints);

  // 속성별 required 여부 맵
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
  const relationFromOptions = relationEndpointOptions?.fromColumns || relationFromToOptions;
  const relationToOptions = relationEndpointOptions?.toColumns || relationFromToOptions;
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

  const hasProperties = relationProps.length > 0;

  const canApply = Boolean(
    effectiveRelationType && effectiveRelationFrom && effectiveRelationTo,
  );

  const handleApply = () => {
    if (!canApply) return;
    onApply(
      column,
      effectiveRelationType,
      effectiveRelationFrom,
      effectiveRelationTo,
      hasPropertySelected ? effectiveRelationProperty : "",
    );
  };

  return (
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
            setRelationProperty(NO_PROPERTY);
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="inline-flex items-center gap-1 text-xs text-gray-600">
            <span>원본 기준 컬럼</span>
            {relationEndpointOptions?.fromLabel && (
              <DisplayWithOriginalTooltip
                display={t(`mapping:nodeLabel.${relationEndpointOptions.fromLabel}`, relationEndpointOptions.fromLabel)}
                original={relationEndpointOptions.fromLabel}
              />
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
          <Label className="inline-flex items-center gap-1 text-xs text-gray-600">
            <span>대상 기준 컬럼</span>
            {relationEndpointOptions?.toLabel && (
              <DisplayWithOriginalTooltip
                display={t(`mapping:nodeLabel.${relationEndpointOptions.toLabel}`, relationEndpointOptions.toLabel)}
                original={relationEndpointOptions.toLabel}
              />
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
      {hasProperties && (
        <div className="space-y-1">
          <Label className="text-xs text-gray-600">속성 (선택)</Label>
          <Select value={effectiveRelationProperty} onValueChange={setRelationProperty}>
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

      {hasPropertySelected && (
        <p className="text-sm text-gray-500">선택 컬럼: {column}</p>
      )}

      <Button
        type="button"
        size="sm"
        className="h-8 w-full bg-gray-900 text-xs hover:bg-gray-800"
        disabled={!canApply}
        onClick={handleApply}
      >
        적용
      </Button>
    </>
  );
}
