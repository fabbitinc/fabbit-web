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
import type {
  RelationTargetInfo,
  TargetPropertyOption,
} from "@/features/onboarding/types/onboarding.types";
import { DisplayWithOriginalTooltip } from "./DisplayWithOriginalTooltip";

const NO_COLUMN = "__NONE__";

interface AddRelationFormProps {
  relationTypeOptions: string[];
  relationPropertyByType: Record<string, string[]>;
  relationTargetInfoByType: Record<string, RelationTargetInfo>;
  targetPropertyOptions: TargetPropertyOption[];
  mappingHeaders: string[];
  onApply: (
    relType: string,
    nodeColumns: Record<string, string>,
    relColumns: Record<string, string>,
    relColumnTypes: Record<string, string>,
  ) => void;
}

export function AddRelationForm({
  relationTypeOptions,
  relationPropertyByType,
  relationTargetInfoByType,
  targetPropertyOptions,
  mappingHeaders,
  onApply,
}: AddRelationFormProps) {
  const { t } = useTranslation(["mapping"]);
  const editableConstraints = useMappingStore((s) => s.editableConstraints);

  const [isOpen, setIsOpen] = useState(false);

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

  // 상대방 노드 속성 목록 (targetLabel로 필터)
  const nodePropertyOptions = useMemo(() => {
    if (!targetLabel) return [];
    return targetPropertyOptions.filter((opt) => opt.label === targetLabel);
  }, [targetPropertyOptions, targetLabel]);

  // 상대방 노드 속성별 컬럼 선택 상태
  const [nodeColumnSelections, setNodeColumnSelections] = useState<Record<string, string>>({});
  // 관계 속성별 컬럼 선택 상태
  const [relColumnSelections, setRelColumnSelections] = useState<Record<string, string>>({});

  const relationProps = effectiveRelationType
    ? relationPropertyByType[effectiveRelationType] || []
    : [];

  // merge key 필수 검증
  const allMergeKeysFilled = targetMergeKeys.every(
    (key) => nodeColumnSelections[key] && nodeColumnSelections[key] !== NO_COLUMN,
  );

  const canApply = Boolean(effectiveRelationType && allMergeKeysFilled);

  const resetForm = () => {
    setRelationType(relationTypeOptions[0] || "");
    setNodeColumnSelections({});
    setRelColumnSelections({});
  };

  const handleApply = () => {
    if (!canApply) return;

    // nodeColumns: { property: sourceColumn } — 빈 값 제외
    const nodeColumns: Record<string, string> = {};
    for (const [prop, col] of Object.entries(nodeColumnSelections)) {
      if (col && col !== NO_COLUMN) {
        nodeColumns[prop] = col;
      }
    }

    // relColumns: { sourceColumn: property }, relColumnTypes: { property: dataType }
    const relColumns: Record<string, string> = {};
    const relColumnTypes: Record<string, string> = {};
    for (const [prop, col] of Object.entries(relColumnSelections)) {
      if (col && col !== NO_COLUMN) {
        relColumns[col] = prop;
        relColumnTypes[prop] = propertyTypeMap[`${effectiveRelationType}:${prop}`] || "string";
      }
    }

    onApply(effectiveRelationType, nodeColumns, relColumns, relColumnTypes);
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
            setNodeColumnSelections({});
            setRelColumnSelections({});
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

      {/* 상대방 노드 섹션 */}
      {targetLabel && (
        <div className="space-y-2 rounded-lg border border-violet-100 bg-white p-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-700">상대방 노드</span>
            <span className="inline-flex items-center rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-semibold text-violet-700">
              <DisplayWithOriginalTooltip
                display={t(`mapping:nodeLabel.${targetLabel}`, targetLabel)}
                original={targetLabel}
              />
            </span>
          </div>

          {nodePropertyOptions.map((opt) => {
            const isMergeKey = targetMergeKeys.includes(opt.property);
            return (
              <div key={opt.property} className="space-y-1">
                <Label className="inline-flex items-center gap-1 text-xs text-gray-600">
                  <DisplayWithOriginalTooltip
                    display={t(`mapping:property.${opt.property}`, opt.property)}
                    original={opt.property}
                  />
                  {isMergeKey && <span className="text-red-500">*</span>}
                  {opt.description && (
                    <span className="text-gray-400">({opt.description})</span>
                  )}
                </Label>
                <Select
                  value={nodeColumnSelections[opt.property] || NO_COLUMN}
                  onValueChange={(value) =>
                    setNodeColumnSelections((prev) => ({ ...prev, [opt.property]: value }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="컬럼 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_COLUMN}>
                      <span className="text-gray-400">선택 안 함</span>
                    </SelectItem>
                    {targetColumnOptions.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      )}

      {/* 관계 속성 섹션 */}
      {relationProps.length > 0 && (
        <div className="space-y-2 rounded-lg border border-gray-100 bg-white p-3">
          <span className="text-xs font-semibold text-gray-700">관계 속성</span>

          {relationProps.map((prop) => {
            const isRequired = propertyRequiredMap[`${effectiveRelationType}:${prop}`] ?? false;
            return (
              <div key={prop} className="space-y-1">
                <Label className="inline-flex items-center gap-1 text-xs text-gray-600">
                  <DisplayWithOriginalTooltip
                    display={t(`mapping:property.${prop}`, prop)}
                    original={prop}
                  />
                  {isRequired && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={relColumnSelections[prop] || NO_COLUMN}
                  onValueChange={(value) =>
                    setRelColumnSelections((prev) => ({ ...prev, [prop]: value }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="컬럼 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_COLUMN}>
                      <span className="text-gray-400">없음</span>
                    </SelectItem>
                    {mappingHeaders.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
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
