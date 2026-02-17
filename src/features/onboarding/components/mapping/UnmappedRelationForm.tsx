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
import type {
  RelationTargetInfo,
  TargetPropertyOption,
} from "@/features/onboarding/types/onboarding.types";
import { DisplayWithOriginalTooltip } from "./DisplayWithOriginalTooltip";

const NO_COLUMN = "__NONE__";

type ColumnRole = "node" | "relation";

interface UnmappedRelationFormProps {
  column: string;
  relationTypeOptions: string[];
  relationPropertyByType: Record<string, string[]>;
  relationTargetInfoByType: Record<string, RelationTargetInfo>;
  targetPropertyOptions: TargetPropertyOption[];
  onApply: (
    relType: string,
    nodeColumns: Record<string, string>,
    relColumns: Record<string, string>,
    relColumnTypes: Record<string, string>,
  ) => void;
}

export function UnmappedRelationForm({
  column,
  relationTypeOptions,
  relationPropertyByType,
  relationTargetInfoByType,
  targetPropertyOptions,
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

  // 속성별 데이터 타입 맵
  const propertyTypeMap = useMemo(() => {
    const catalog = editableConstraints?.relation_property_catalog || [];
    const map: Record<string, string> = {};
    catalog.forEach((item) => {
      map[`${item.rel_type}:${item.property}`] = item.data_type;
    });
    return map;
  }, [editableConstraints]);

  const [relationType, setRelationType] = useState<string>(relationTypeOptions[0] || "");
  const effectiveRelationType = relationType || relationTypeOptions[0] || "";
  const targetInfo = relationTargetInfoByType[effectiveRelationType];
  const targetLabel = targetInfo?.targetLabel || "";
  const targetMergeKeys = targetInfo?.targetMergeKeys || [];
  const targetColumnOptions = targetInfo?.targetColumnOptions || [];

  // 상대방 노드의 merge key 컬럼 선택 (필수)
  const [mergeKeyColumn, setMergeKeyColumn] = useState<string>(targetColumnOptions[0] || "");
  const effectiveMergeKeyColumn =
    targetColumnOptions.includes(mergeKeyColumn) ? mergeKeyColumn : targetColumnOptions[0] || "";

  // 이 컬럼의 역할 선택
  const [columnRole, setColumnRole] = useState<ColumnRole>("node");

  // 상대방 노드 속성 목록 (targetLabel로 필터)
  const nodePropertyOptions = useMemo(() => {
    if (!targetLabel) return [];
    return targetPropertyOptions
      .filter((opt) => opt.label === targetLabel)
      .filter((opt) => !targetMergeKeys.includes(opt.property));
  }, [targetPropertyOptions, targetLabel, targetMergeKeys]);

  // 관계 속성 목록
  const relationProps = effectiveRelationType
    ? relationPropertyByType[effectiveRelationType] || []
    : [];

  // 구체적 속성 선택
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const propertyOptions = columnRole === "node" ? nodePropertyOptions.map((o) => o.property) : relationProps;
  const effectiveSelectedProperty =
    propertyOptions.includes(selectedProperty) ? selectedProperty : "";

  const canApply = Boolean(
    effectiveRelationType &&
    effectiveMergeKeyColumn &&
    effectiveSelectedProperty,
  );

  const handleApply = () => {
    if (!canApply) return;

    const primaryMergeKey = targetMergeKeys[0] || "";
    if (!primaryMergeKey) return;

    if (columnRole === "node") {
      // 이 컬럼을 노드 속성으로 할당
      const nodeColumns: Record<string, string> = {
        [primaryMergeKey]: effectiveMergeKeyColumn,
        [effectiveSelectedProperty]: column,
      };
      onApply(effectiveRelationType, nodeColumns, {}, {});
    } else {
      // 이 컬럼을 관계 속성으로 할당
      const nodeColumns: Record<string, string> = {
        [primaryMergeKey]: effectiveMergeKeyColumn,
      };
      const relColumns: Record<string, string> = {
        [column]: effectiveSelectedProperty,
      };
      const relColumnTypes: Record<string, string> = {
        [effectiveSelectedProperty]: propertyTypeMap[`${effectiveRelationType}:${effectiveSelectedProperty}`] || "string",
      };
      onApply(effectiveRelationType, nodeColumns, relColumns, relColumnTypes);
    }
  };

  return (
    <>
      <div className="space-y-1">
        <Label className="text-xs text-gray-600">타입</Label>
        <Select
          value={effectiveRelationType}
          onValueChange={(value) => {
            setRelationType(value);
            const info = relationTargetInfoByType[value];
            setMergeKeyColumn(info?.targetColumnOptions[0] || "");
            setSelectedProperty("");
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

      {/* 상대방 노드 merge key 컬럼 */}
      {targetLabel && targetMergeKeys.length > 0 && (
        <div className="space-y-1">
          <Label className="inline-flex items-center gap-1.5 text-xs text-gray-600">
            <span>상대방 노드 기준 컬럼</span>
            <span className="inline-flex items-center rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-semibold text-violet-700">
              <DisplayWithOriginalTooltip
                display={t(`mapping:nodeLabel.${targetLabel}`, targetLabel)}
                original={targetLabel}
              />
            </span>
            <span className="text-red-500">*</span>
          </Label>
          <Select value={effectiveMergeKeyColumn} onValueChange={setMergeKeyColumn}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="기준 컬럼 선택" />
            </SelectTrigger>
            <SelectContent>
              {targetColumnOptions.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 이 컬럼의 역할 */}
      <div className="space-y-1">
        <Label className="text-xs text-gray-600">이 컬럼의 역할</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={columnRole === "node" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setColumnRole("node");
              setSelectedProperty("");
            }}
          >
            노드 속성
          </Button>
          {relationProps.length > 0 && (
            <Button
              type="button"
              variant={columnRole === "relation" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setColumnRole("relation");
                setSelectedProperty("");
              }}
            >
              관계 속성
            </Button>
          )}
        </div>
      </div>

      {/* 구체적 속성 선택 */}
      <div className="space-y-1">
        <Label className="text-xs text-gray-600">
          {columnRole === "node" ? "노드 속성" : "관계 속성"}
        </Label>
        <Select value={effectiveSelectedProperty || NO_COLUMN} onValueChange={(v) => setSelectedProperty(v === NO_COLUMN ? "" : v)}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="속성 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_COLUMN}>
              <span className="text-gray-400">선택하세요</span>
            </SelectItem>
            {propertyOptions.map((prop) => {
              const isRequired = columnRole === "relation"
                ? (propertyRequiredMap[`${effectiveRelationType}:${prop}`] ?? false)
                : false;
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
    </>
  );
}
