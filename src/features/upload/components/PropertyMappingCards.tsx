import { useState } from "react";
import { josa } from "es-hangul";
import {
  AlertTriangle,
  CheckCircle2,
  Type,
  Hash,
  List,
  ListChecks,
  ToggleLeft,
  Calendar,
  X,
  Plus,
  Link,
  Ban,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  AttributeDataType,
  AttributeDefinitionDto,
  SuggestedAttributeResponse,
} from "@/api/types/import";

// ============================================
// 프론트엔드 내부 타입
// ============================================
export type PropertyType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "multiselect";
export type ActionType = "create" | "link" | "skip";
export type PropertyStatus = "existing" | "new" | "similar";

export interface PropertyMapping {
  id: string;
  originalColumn: string; // SuggestedAttributeResponse.name
  displayName: string;
  type: PropertyType;
  status: PropertyStatus;
  similarTo?: string;
  options?: string[];
  confidence?: number;
  // 처리 관련
  action: ActionType;
  linkedPropertyId?: string;
  isConfigured: boolean;
}

export interface ExistingProperty {
  id: string;
  name: string;
  displayName: string;
  type: PropertyType;
}

// ============================================
// 상수
// ============================================

// 백엔드 → 프론트엔드 타입 변환
export const DATA_TYPE_MAP: Record<AttributeDataType, PropertyType> = {
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  DATE: "date",
  SELECT: "select",
  MULTI_SELECT: "multiselect",
};

// 프론트엔드 → 백엔드 타입 변환
export const REVERSE_DATA_TYPE_MAP: Record<PropertyType, AttributeDataType> = {
  string: "STRING",
  number: "NUMBER",
  boolean: "BOOLEAN",
  date: "DATE",
  select: "SELECT",
  multiselect: "MULTI_SELECT",
};

export const PROPERTY_TYPES: {
  value: PropertyType;
  label: string;
  icon: typeof Type;
}[] = [
  { value: "string", label: "텍스트", icon: Type },
  { value: "number", label: "숫자", icon: Hash },
  { value: "boolean", label: "예/아니오", icon: ToggleLeft },
  { value: "date", label: "날짜", icon: Calendar },
  { value: "select", label: "선택", icon: List },
  { value: "multiselect", label: "다중선택", icon: ListChecks },
];

export const ACTION_OPTIONS: {
  value: ActionType;
  label: string;
  icon: typeof Plus;
}[] = [
  { value: "create", label: "새 속성 생성", icon: Plus },
  { value: "link", label: "기존 속성 사용", icon: Link },
  { value: "skip", label: "사용 안 함", icon: Ban },
];

// ============================================
// 변환 함수
// ============================================
export function convertAttributeToExistingProperty(
  attr: AttributeDefinitionDto,
): ExistingProperty {
  return {
    id: attr.id,
    name: attr.name,
    displayName: attr.displayName,
    type: DATA_TYPE_MAP[attr.dataType],
  };
}

export function convertSuggestedToPropertyMapping(
  suggested: SuggestedAttributeResponse,
  index: number,
): PropertyMapping {
  const hasSimilar = !!suggested.similarAttribute;
  return {
    id: `suggested-${index}`,
    originalColumn: suggested.name,
    displayName: suggested.displayName,
    type: DATA_TYPE_MAP[suggested.dataType],
    status: hasSimilar ? "similar" : "new",
    similarTo: suggested.similarAttribute?.name,
    options: suggested.options ?? undefined,
    confidence: suggested.confidence,
    action: hasSimilar ? "link" : "create",
    linkedPropertyId: suggested.similarAttribute?.id,
    isConfigured: false,
  };
}

export function convertExistsToPropertyMapping(
  attr: AttributeDefinitionDto,
  index: number,
): PropertyMapping {
  return {
    id: `existing-${index}`,
    originalColumn: attr.name,
    displayName: attr.displayName,
    type: DATA_TYPE_MAP[attr.dataType],
    status: "existing",
    options: attr.options ?? undefined,
    action: "link",
    linkedPropertyId: attr.id,
    isConfigured: true,
  };
}

// ============================================
// 컴포넌트: 축소된 카드 (설정 완료 상태)
// ============================================
interface CompactPropertyCardProps {
  mapping: PropertyMapping;
  existingProperties: ExistingProperty[];
  onEdit: () => void;
}

export function CompactPropertyCard({
  mapping,
  existingProperties,
  onEdit,
}: CompactPropertyCardProps) {
  const TypeIcon =
    PROPERTY_TYPES.find((t) => t.value === mapping.type)?.icon ?? Type;
  const linkedProperty = existingProperties.find(
    (p) => p.id === mapping.linkedPropertyId,
  );

  const getActionSummary = () => {
    switch (mapping.action) {
      case "link":
        return (
          <span className="flex items-center gap-1 text-[#3b82f6]">
            <Link className="h-3 w-3" />
            기존 속성 사용
          </span>
        );
      case "skip":
        return (
          <span className="flex items-center gap-1 text-[#94a3b8]">
            <Ban className="h-3 w-3" />
            사용 안 함
          </span>
        );
      case "create":
      default:
        return (
          <span className="flex items-center gap-1 text-[#22c55e]">
            <Plus className="h-3 w-3" />새 속성 생성
          </span>
        );
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border",
        mapping.action === "skip"
          ? "bg-[#f8fafc] border-[#e2e8f0] opacity-60"
          : "bg-white border-[#e2e8f0]",
      )}
    >
      {/* Status Icon */}
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full",
          mapping.action === "skip" ? "bg-[#f1f5f9]" : "bg-[#22c55e]/10",
        )}
      >
        {mapping.action === "skip" ? (
          <Ban className="h-3.5 w-3.5 text-[#94a3b8]" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
        )}
      </div>

      {/* Original Column */}
      <code className="rounded bg-[#f1f5f9] px-2 py-0.5 text-xs font-mono text-[#64748b]">
        {mapping.originalColumn}
      </code>

      <span className="text-[#94a3b8]">→</span>

      {/* Display Name & Type */}
      {mapping.action !== "skip" && (
        <>
          <span className="text-sm font-medium text-[#0f172a]">
            {mapping.action === "link" && linkedProperty
              ? linkedProperty.displayName
              : mapping.displayName}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[#f1f5f9] px-2 py-0.5 text-xs text-[#64748b]">
            <TypeIcon className="h-3 w-3" />
            {PROPERTY_TYPES.find((t) => t.value === mapping.type)?.label}
          </span>
        </>
      )}

      {/* Action Summary */}
      <span className="text-xs">{getActionSummary()}</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Edit Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="h-7 px-2 text-[#64748b] hover:text-[#0f172a]"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ============================================
// 컴포넌트: 펼쳐진 카드 (설정 중 상태)
// ============================================
interface ExpandedPropertyCardProps {
  mapping: PropertyMapping;
  existingProperties: ExistingProperty[];
  onUpdate: (updates: Partial<PropertyMapping>) => void;
  onConfirm: () => void;
}

export function ExpandedPropertyCard({
  mapping,
  existingProperties,
  onUpdate,
  onConfirm,
}: ExpandedPropertyCardProps) {
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    if (newOption.trim()) {
      const currentOptions = mapping.options ?? [];
      onUpdate({ options: [...currentOptions, newOption.trim()] });
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    if (mapping.options) {
      onUpdate({ options: mapping.options.filter((_, i) => i !== index) });
    }
  };

  const isValid = () => {
    if (mapping.action === "skip") return true;
    if (mapping.action === "link" && !mapping.linkedPropertyId) return false;
    if (mapping.action === "create") {
      if (!mapping.displayName.trim()) return false;
      if (
        (mapping.type === "select" || mapping.type === "multiselect") &&
        (!mapping.options || mapping.options.length === 0)
      ) {
        return false;
      }
    }
    return true;
  };

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden",
        mapping.status === "similar"
          ? "border-[#fbbf24]/50 bg-[#fffbeb]/30"
          : "border-[#e2e8f0] bg-white",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3">
          <code className="rounded bg-[#e2e8f0] px-2 py-1 text-sm font-mono text-[#0f172a]">
            {mapping.originalColumn}
          </code>
          {mapping.status === "similar" && mapping.similarTo && (
            <span className="flex items-center gap-1 rounded-full bg-[#fbbf24]/20 px-2 py-0.5 text-xs text-[#92400e]">
              <AlertTriangle className="h-3 w-3 text-[#f59e0b]" />
              "{mapping.similarTo}"{josa(mapping.similarTo, "와/과").slice(mapping.similarTo.length)} 유사
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Action Selection */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-[#64748b] w-20 shrink-0">
            처리 방식
          </label>
          <div className="flex gap-2 w-[360px]">
            {ACTION_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = mapping.action === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => onUpdate({ action: option.value })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                    isSelected
                      ? option.value === "skip"
                        ? "bg-[#f1f5f9] border-[#94a3b8] text-[#64748b]"
                        : option.value === "link"
                          ? "bg-[#3b82f6] border-[#3b82f6] text-white"
                          : "bg-[#22c55e] border-[#22c55e] text-white"
                      : "bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Link to Existing Property */}
        {mapping.action === "link" && (
          <div className="flex items-center gap-4">
            <label className="text-sm text-[#64748b] w-20 shrink-0">
              대상 속성
            </label>
            <Select
              value={mapping.linkedPropertyId ?? ""}
              onValueChange={(value) => onUpdate({ linkedPropertyId: value })}
            >
              <SelectTrigger className="w-[360px]">
                <SelectValue placeholder="기존 속성 선택..." />
              </SelectTrigger>
              <SelectContent>
                {existingProperties.map((prop) => {
                  const TypeIcon = PROPERTY_TYPES.find((t) => t.value === prop.type)?.icon ?? Type;
                  const typeLabel = PROPERTY_TYPES.find((t) => t.value === prop.type)?.label ?? "";
                  return (
                    <SelectItem key={prop.id} value={prop.id}>
                      <span className="flex items-center gap-2">
                        <code className="text-xs font-mono text-[#0f172a] bg-[#f1f5f9] px-1.5 py-0.5 rounded">
                          {prop.name}
                        </code>
                        <span className="text-sm text-[#64748b]">
                          {prop.displayName}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
                          <TypeIcon className="h-3 w-3" />
                          {typeLabel}
                        </span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Create New Property Options */}
        {mapping.action === "create" && (
          <>
            {/* Display Name */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-[#64748b] w-20 shrink-0">
                표시 이름
              </label>
              <Input
                value={mapping.displayName}
                onChange={(e) => onUpdate({ displayName: e.target.value })}
                className="w-[360px]"
                placeholder="속성 이름 입력"
              />
            </div>

            {/* Type Selection */}
            <div className="flex items-start gap-4">
              <label className="text-sm text-[#64748b] w-20 shrink-0 pt-2">
                타입
              </label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = mapping.type === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() =>
                        onUpdate({ type: type.value, options: undefined })
                      }
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-[#3b82f6] text-white"
                          : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options for select/multiselect */}
            {(mapping.type === "select" || mapping.type === "multiselect") && (
              <div className="flex items-start gap-4">
                <label className="text-sm text-[#64748b] w-20 shrink-0 pt-2">
                  선택 옵션
                </label>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {mapping.options?.map((option, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] px-3 py-1 text-sm text-[#0f172a]"
                      >
                        {option}
                        <button
                          onClick={() => removeOption(index)}
                          className="ml-1 text-[#94a3b8] hover:text-[#ef4444]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {(!mapping.options || mapping.options.length === 0) && (
                      <span className="text-xs text-[#f59e0b]">
                        최소 1개 옵션이 필요합니다
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="새 옵션 입력"
                      className="max-w-[200px] h-8 text-sm"
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addOption())
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="h-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Skip message */}
        {mapping.action === "skip" && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#f1f5f9] text-sm text-[#64748b]">
            <Ban className="h-4 w-4" />이 컬럼은 가져오지 않습니다
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
        <Button
          onClick={onConfirm}
          disabled={!isValid()}
          size="sm"
          className="bg-[#3b82f6] hover:bg-[#2563eb]"
        >
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          설정 완료
        </Button>
      </div>
    </div>
  );
}
