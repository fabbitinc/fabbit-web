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
import type { TargetPropertyOption } from "@/features/onboarding/types/onboarding.types";
import { DisplayWithOriginalTooltip } from "./DisplayWithOriginalTooltip";

interface UnmappedBaseFormProps {
  column: string;
  labels: string[];
  targetOptions: TargetPropertyOption[];
  onApply: (sourceColumn: string, targetLabel: string, targetProperty: string) => void;
}

export function UnmappedBaseForm({ column, labels, targetOptions, onApply }: UnmappedBaseFormProps) {
  const { t } = useTranslation(["mapping"]);
  const [baseLabel, setBaseLabel] = useState<string>(labels[0] || "");
  const baseProperties = useMemo(
    () => targetOptions.filter((opt) => opt.label === baseLabel),
    [targetOptions, baseLabel],
  );
  const [baseProperty, setBaseProperty] = useState<string>("");

  const canApply = Boolean(baseLabel && baseProperty);

  const handleApply = () => {
    if (!canApply) return;
    onApply(column, baseLabel, baseProperty);
  };

  return (
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
