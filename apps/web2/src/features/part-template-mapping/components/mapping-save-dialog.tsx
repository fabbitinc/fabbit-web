import { useEffect, useMemo, useState } from "react";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fabbit/ui";
import { cn } from "@/lib/utils";
import type { MappingRecordModel } from "@/features/part-template-mapping/types/part-template-mapping-model";

interface MappingSaveDialogProps {
  open: boolean;
  defaultMappingName: string;
  isLoadingMappings: boolean;
  isSubmitting: boolean;
  mappings: MappingRecordModel[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    saveMode: "existing" | "new";
    selectedMappingId: string;
    mappingName: string;
    duplicateNameExists: boolean;
  }) => void;
}

export function MappingSaveDialog({
  open,
  defaultMappingName,
  isLoadingMappings,
  isSubmitting,
  mappings,
  onOpenChange,
  onConfirm,
}: MappingSaveDialogProps) {
  const hasMappings = mappings.length > 0;
  const [saveMode, setSaveMode] = useState<"existing" | "new">("new");
  const [selectedMappingId, setSelectedMappingId] = useState("");
  const [mappingName, setMappingName] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (hasMappings) {
      setSaveMode("existing");
      setSelectedMappingId(mappings[0].id);
      setMappingName(mappings[0].name);
      return;
    }

    setSaveMode("new");
    setSelectedMappingId("");
    setMappingName(defaultMappingName);
  }, [defaultMappingName, hasMappings, mappings, open]);

  const existingNameSet = useMemo(
    () => new Set(mappings.map((mapping) => mapping.name.trim().toLowerCase())),
    [mappings],
  );

  const duplicateNameExists = useMemo(() => {
    if (saveMode !== "new") {
      return false;
    }

    const normalizedName = mappingName.trim().toLowerCase();
    if (!normalizedName) {
      return false;
    }

    return existingNameSet.has(normalizedName);
  }, [existingNameSet, mappingName, saveMode]);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>매핑 저장 방식 선택</DialogTitle>
        <DialogDescription>기존 매핑을 업데이트하거나 새 매핑을 생성할 수 있습니다.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!hasMappings}
            onClick={() => setSaveMode("existing")}
            className={cn(
              "rounded-2xl border px-3 py-3 text-sm font-medium transition-colors",
              saveMode === "existing"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted/50",
              !hasMappings && "cursor-not-allowed opacity-50",
            )}
          >
            기존 매핑 업데이트
          </button>
          <button
            type="button"
            onClick={() => setSaveMode("new")}
            className={cn(
              "rounded-2xl border px-3 py-3 text-sm font-medium transition-colors",
              saveMode === "new"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted/50",
            )}
          >
            신규 매핑 생성
          </button>
        </div>

        {saveMode === "existing" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">기존 매핑</p>
            <Select
              value={selectedMappingId}
              onValueChange={setSelectedMappingId}
              disabled={isLoadingMappings || !hasMappings}
            >
              <SelectTrigger>
                <SelectValue placeholder="업데이트할 매핑을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {mappings.map((mapping) => (
                  <SelectItem key={mapping.id} value={mapping.id}>
                    {mapping.name} (v{mapping.version})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {saveMode === "new" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">매핑 이름</p>
            <Input
              value={mappingName}
              onChange={(event) => setMappingName(event.target.value)}
              placeholder="매핑 이름을 입력하세요"
              disabled={isLoadingMappings}
            />
            {duplicateNameExists && <p className="text-xs text-[var(--status-danger)]">동일한 이름은 사용할 수 없습니다.</p>}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
          취소
        </Button>
        <Button
          onClick={() =>
            onConfirm({
              saveMode,
              selectedMappingId,
              mappingName,
              duplicateNameExists,
            })
          }
          disabled={
            isLoadingMappings ||
            isSubmitting ||
            (saveMode === "new" && (!mappingName.trim() || duplicateNameExists)) ||
            (saveMode === "existing" && !selectedMappingId)
          }
        >
          확인
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
