import { useState } from "react";
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
import type { TargetPropertyOption } from "@/features/onboarding/types/onboarding.types";
import { toExtendedPropertyName } from "@/features/onboarding/utils/mappingUtils";
import { useMappingStore } from "@/stores/onboarding";
import { DisplayWithOriginalTooltip } from "./DisplayWithOriginalTooltip";

const EXTENDED_VALUE = "__EXTENDED__";

interface UnmappedBaseFormProps {
  column: string;
  targetOptions: TargetPropertyOption[];
  onApply: (sourceColumn: string, targetProperty: string) => void;
  onApplyExtended?: (sourceColumn: string, propertyName?: string) => void;
}

export function UnmappedBaseForm({ column, targetOptions, onApply, onApplyExtended }: UnmappedBaseFormProps) {
  const { t } = useTranslation(["mapping"]);
  const [baseProperty, setBaseProperty] = useState<string>("");

  // 스토어에서 직접 읽어서 이미 매핑된 기본 속성을 드롭다운에서 제외
  const columnMappings = useMappingStore((s) => s.columnMappings);
  const mappedBaseProperties = new Set(
    columnMappings.filter((cm) => !cm.is_extended).map((cm) => cm.target_property),
  );
  const availableOptions = targetOptions.filter((opt) => !mappedBaseProperties.has(opt.property));

  const isExtended = baseProperty === EXTENDED_VALUE;
  const canApply = Boolean(baseProperty);

  const handleApply = () => {
    if (!canApply) return;
    if (isExtended) {
      onApplyExtended?.(column, toExtendedPropertyName(column));
    } else {
      onApply(column, baseProperty);
    }
  };

  return (
    <>
      <div className="space-y-1">
        <Label className="text-xs text-gray-600">속성</Label>
        <Select value={baseProperty} onValueChange={setBaseProperty}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="속성 선택" />
          </SelectTrigger>
          <SelectContent>
            {availableOptions.map((prop) => (
              <SelectItem key={`${prop.label}.${prop.property}`} value={prop.property}>
                <DisplayWithOriginalTooltip
                  display={t(`mapping:property.${prop.property}`, prop.property)}
                  original={prop.property}
                />
              </SelectItem>
            ))}
            {onApplyExtended && (
              <SelectItem value={EXTENDED_VALUE}>
                <span className="text-amber-600">확장 속성</span>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {isExtended && (
        <p className="text-xs text-gray-500">
          속성명: <span className="font-mono text-gray-700">{toExtendedPropertyName(column)}</span>
        </p>
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
    </>
  );
}
