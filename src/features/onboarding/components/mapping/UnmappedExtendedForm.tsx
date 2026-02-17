import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toExtendedPropertyName } from "@/features/onboarding/utils/mappingUtils";

interface UnmappedExtendedFormProps {
  column: string;
  onApply: (sourceColumn: string, propertyName?: string) => void;
}

export function UnmappedExtendedForm({ column, onApply }: UnmappedExtendedFormProps) {
  const [extendedPropertyName, setExtendedPropertyName] = useState<string>(
    toExtendedPropertyName(column),
  );

  const canApply = Boolean(extendedPropertyName);

  const handleApply = () => {
    onApply(column, extendedPropertyName);
  };

  return (
    <>
      <div className="space-y-1">
        <Label className="text-xs text-gray-600">속성명</Label>
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
