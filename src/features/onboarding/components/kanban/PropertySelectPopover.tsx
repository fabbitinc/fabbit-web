import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMappingStore } from "@/stores/onboarding";
import type { KanbanColumnId } from "@/features/onboarding/hooks/useMappingKanban";
import { COLUMN_TO_REL_TYPE } from "@/features/onboarding/hooks/useMappingKanban";
import type {
  TargetPropertyOption,
  RelationTargetInfo,
} from "@/features/onboarding/types/onboarding.types";

// 드롭 후 속성 선택을 위한 대기 정보
export interface PendingDrop {
  sourceColumn: string;
  fromColumnId: KanbanColumnId;
  toColumnId: KanbanColumnId;
  anchorRect: { x: number; y: number };
}

// Part 컬럼용 모드
type PartMode = "base" | "extended";

interface PropertySelectPopoverProps {
  pendingDrop: PendingDrop | null;
  onClose: () => void;
  onCreateColumnMapping: (sourceColumn: string, targetProperty: string) => void;
  onCreateExtendedMapping: (sourceColumn: string) => void;
  onCreateRelationMapping: (
    relType: string,
    nodeColumns: Record<string, string>,
    relColumns: Record<string, string>,
    relColumnTypes: Record<string, string>,
  ) => void;
  effectiveTargetOptions: TargetPropertyOption[];
  selectableRelationTypeOptions: string[];
  relationPropertyByType: Record<string, string[]>;
  relationTargetInfoByType: Record<string, RelationTargetInfo>;
}

export function PropertySelectPopover({
  pendingDrop,
  onClose,
  ...props
}: PropertySelectPopoverProps) {
  if (!pendingDrop) return null;

  // key를 사용해 pendingDrop 변경 시 내부 상태 초기화
  return (
    <PropertySelectPopoverInner
      key={pendingDrop.sourceColumn + pendingDrop.toColumnId}
      pendingDrop={pendingDrop}
      onClose={onClose}
      {...props}
    />
  );
}

function PropertySelectPopoverInner({
  pendingDrop,
  onClose,
  onCreateColumnMapping,
  onCreateExtendedMapping,
  onCreateRelationMapping,
  effectiveTargetOptions,
  relationPropertyByType,
  relationTargetInfoByType,
}: Omit<
  PropertySelectPopoverProps,
  "pendingDrop" | "selectableRelationTypeOptions"
> & { pendingDrop: PendingDrop }) {
  const { t } = useTranslation(["mapping"]);
  const columnMappings = useMappingStore((s) => s.columnMappings);
  const relationMappings = useMappingStore((s) => s.relationMappings);
  const targetPropertyOptions = useMappingStore((s) => s.targetPropertyOptions);
  const partMergeKeys = new Set(
    targetPropertyOptions
      .filter((opt) => opt.label === "Part" && opt.is_merge_key)
      .map((opt) => opt.property),
  );

  const [partMode, setPartMode] = useState<PartMode>("base");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedNodeColumn, setSelectedNodeColumn] = useState("");
  const [selectedRelProperty, setSelectedRelProperty] = useState("");
  const [selectedRole, setSelectedRole] = useState<"node" | "rel">("node");

  const { sourceColumn, toColumnId } = pendingDrop;

  // ── Part 컬럼으로 드롭 ──
  if (toColumnId === "Part") {
    const mappedProperties = new Set(
      columnMappings
        .filter((cm) => !cm.is_extended)
        .map((cm) => cm.target_property),
    );
    const availableOptions = effectiveTargetOptions.filter(
      (opt) => !mappedProperties.has(opt.property),
    );

    const handleApply = () => {
      if (partMode === "extended") {
        onCreateExtendedMapping(sourceColumn);
      } else if (selectedProperty) {
        onCreateColumnMapping(sourceColumn, selectedProperty);
      }
      onClose();
    };

    return (
      <Popover open onOpenChange={(open) => !open && onClose()}>
        <PopoverAnchor
          className="pointer-events-none fixed"
          style={{
            left: pendingDrop.anchorRect.x,
            top: pendingDrop.anchorRect.y,
          }}
        />
        <PopoverContent align="start" className="w-72 space-y-3">
          <p className="text-sm font-medium">"{sourceColumn}" 속성 선택</p>

          <div className="flex gap-1 rounded-md border border-gray-200 p-0.5">
            <button
              className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${partMode === "base" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setPartMode("base")}
            >
              기본 속성
            </button>
            <button
              className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${partMode === "extended" ? "bg-amber-100 text-amber-700" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setPartMode("extended")}
            >
              확장 속성
            </button>
          </div>

          {partMode === "base" && (
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="속성 선택..." />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.map((opt) => (
                  <SelectItemWithTooltip
                    key={opt.property}
                    value={opt.property}
                    display={t(
                      `mapping:property.${opt.property}`,
                      opt.property,
                    )}
                    original={opt.property}
                    required={partMergeKeys.has(opt.property)}
                  />
                ))}
              </SelectContent>
            </Select>
          )}

          {partMode === "extended" && (
            <p className="text-xs text-gray-500">
              확장 속성으로 자동 매핑됩니다.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              size="sm"
              className="h-7 bg-blue-600 text-xs hover:bg-blue-700"
              disabled={partMode === "base" && !selectedProperty}
              onClick={handleApply}
            >
              적용
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // ── 관계 컬럼으로 드롭 ──
  const relType = COLUMN_TO_REL_TYPE[toColumnId];
  if (!relType) return null;

  const targetInfo = relationTargetInfoByType[relType];
  const relProperties = relationPropertyByType[relType] || [];

  const findExistingRelation = () =>
    relationMappings.find((rm) => rm.rel_type === relType && !rm.dismissed);

  const handleApply = () => {
    const existing = findExistingRelation();

    if (selectedRole === "node") {
      if (!selectedNodeColumn) return;
      const nodeColumns = existing
        ? { ...existing.node_columns, [selectedNodeColumn]: sourceColumn }
        : { [selectedNodeColumn]: sourceColumn };
      const relColumns = existing?.rel_columns || {};
      const relColumnTypes = existing?.rel_column_types || {};
      onCreateRelationMapping(relType, nodeColumns, relColumns, relColumnTypes);
    } else {
      if (!selectedRelProperty) return;
      const nodeColumns = { ...(existing?.node_columns || {}) };
      if (Object.keys(nodeColumns).length === 0) {
        const mergeKeys = targetInfo?.targetMergeKeys || [];
        for (const mk of mergeKeys) {
          const matched = columnMappings.find(
            (cm) => !cm.is_extended && cm.target_property === mk,
          );
          if (matched) {
            nodeColumns[mk] = matched.source_column;
          }
        }
      }
      const relColumns = {
        ...(existing?.rel_columns || {}),
        [sourceColumn]: selectedRelProperty,
      };
      const relColumnTypes = {
        ...(existing?.rel_column_types || {}),
        [selectedRelProperty]: "string",
      };
      onCreateRelationMapping(relType, nodeColumns, relColumns, relColumnTypes);
    }
    onClose();
  };

  return (
    <Popover open onOpenChange={(open) => !open && onClose()}>
      <PopoverAnchor
        className="pointer-events-none fixed"
        style={{
          left: pendingDrop.anchorRect.x,
          top: pendingDrop.anchorRect.y,
        }}
      />
      <PopoverContent align="start" className="w-72 space-y-3">
        <p className="text-sm font-medium">"{sourceColumn}" 관계 속성 선택</p>

        <div className="flex gap-1 rounded-md border border-gray-200 p-0.5">
          <button
            className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${selectedRole === "node" ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setSelectedRole("node")}
          >
            노드 매칭 키
          </button>
          <button
            className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${selectedRole === "rel" ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setSelectedRole("rel")}
          >
            관계 속성
          </button>
        </div>

        {selectedRole === "node" && (
          <Select
            value={selectedNodeColumn}
            onValueChange={setSelectedNodeColumn}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="매칭 키 선택..." />
            </SelectTrigger>
            <SelectContent>
              {(targetInfo?.targetProperties || targetInfo?.targetMergeKeys || []).map((key) => (
                <SelectItemWithTooltip
                  key={key}
                  value={key}
                  display={t(`mapping:property.${key}`, key)}
                  original={key}
                  required={(targetInfo?.targetMergeKeys || []).includes(key)}
                />
              ))}
            </SelectContent>
          </Select>
        )}

        {selectedRole === "rel" && (
          <Select
            value={selectedRelProperty}
            onValueChange={setSelectedRelProperty}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="관계 속성 선택..." />
            </SelectTrigger>
            <SelectContent>
              {relProperties.map((prop) => (
                <SelectItemWithTooltip
                  key={prop}
                  value={prop}
                  display={t(`mapping:property.${prop}`, prop)}
                  original={prop}
                />
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            size="sm"
            className="h-7 bg-blue-600 text-xs hover:bg-blue-700"
            disabled={
              (selectedRole === "node" && !selectedNodeColumn) ||
              (selectedRole === "rel" && !selectedRelProperty)
            }
            onClick={handleApply}
          >
            적용
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SelectItemWithTooltip({
  value,
  display,
  original,
  required = false,
}: {
  value: string;
  display: string;
  original: string;
  required?: boolean;
}) {
  const content = (
    <span className="inline-flex w-full items-center gap-1">
      <span className="truncate">{display}</span>
      {required && (
        <span className="text-[10px] font-semibold text-red-500" aria-label="필수">
          *
        </span>
      )}
    </span>
  );

  if (display === original) {
    return <SelectItem value={value}>{content}</SelectItem>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SelectItem value={value}>{content}</SelectItem>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        hideArrow
        className="rounded-md bg-slate-800 px-2 py-1 text-xs text-white"
      >
        {original}
      </TooltipContent>
    </Tooltip>
  );
}
