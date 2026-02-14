import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { toExtendedPropertyName } from "@/features/onboarding/utils/mappingUtils";
import { DisplayWithOriginalTooltip } from "./DisplayWithOriginalTooltip";

interface UnmappedExtendedFormProps {
  column: string;
  labels: string[];
  onApply: (sourceColumn: string, targetLabel: string, propertyName?: string) => void;
}

export function UnmappedExtendedForm({ column, labels, onApply }: UnmappedExtendedFormProps) {
  const { t } = useTranslation(["mapping"]);
  const [extendedLabel, setExtendedLabel] = useState<string>(labels[0] || "");
  const [extendedPropertyName, setExtendedPropertyName] = useState<string>(
    toExtendedPropertyName(column),
  );

  const canApply = Boolean(extendedLabel && extendedPropertyName);

  const handleApply = () => {
    if (!extendedLabel) return;
    onApply(column, extendedLabel, extendedPropertyName);
  };

  return (
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
