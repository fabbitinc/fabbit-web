import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
} from "@fabbit/ui";
import { Loader2 } from "lucide-react";
import type { NumberingCategoryModel } from "@/features/part-number-categories/types/numbering-categories.types";

interface NumberingCategoryFormValues {
  name: string;
  autoNumberingEnabled: boolean;
  formatPrefix: string;
  formatSuffix: string;
  digits: number;
}

const DEFAULT_VALUES: NumberingCategoryFormValues = {
  name: "",
  autoNumberingEnabled: true,
  formatPrefix: "",
  formatSuffix: "",
  digits: 4,
};

function clampDigits(value: number): number {
  return Math.max(1, Math.min(10, value));
}

function buildPreview(values: NumberingCategoryFormValues): string {
  const clamped = clampDigits(values.digits);
  const seq = "0".repeat(Math.max(1, clamped - 1)) + "1";
  return `${values.formatPrefix}${seq}${values.formatSuffix}`;
}

interface NumberingCategoryFormModalProps {
  open: boolean;
  editTarget?: NumberingCategoryModel | null;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (values: NumberingCategoryFormValues) => void;
}

export function NumberingCategoryFormModal({
  open,
  editTarget,
  isPending = false,
  onClose,
  onSubmit,
}: NumberingCategoryFormModalProps) {
  const isEdit = !!editTarget;
  const [values, setValues] = useState<NumberingCategoryFormValues>(DEFAULT_VALUES);

  useEffect(() => {
    if (open) {
      if (editTarget) {
        setValues({
          name: editTarget.name,
          autoNumberingEnabled: editTarget.autoNumberingEnabled,
          formatPrefix: editTarget.formatPrefix,
          formatSuffix: editTarget.formatSuffix,
          digits: editTarget.digits,
        });
      } else {
        setValues(DEFAULT_VALUES);
      }
    }
  }, [open, editTarget]);

  const nameEmpty = values.name.trim() === "";
  const digitsInvalid = values.autoNumberingEnabled && (values.digits < 1 || values.digits > 10);
  const canSubmit = !nameEmpty && !digitsInvalid && !isPending;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "카테고리 수정" : "카테고리 추가"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "카테고리 이름과 채번 규칙을 수정합니다."
              : "새 카테고리를 만듭니다. 자동 채번을 활성화하면 부품 생성 시 품번이 자동으로 부여됩니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nc-name">이름</Label>
            <Input
              id="nc-name"
              placeholder="예: 기구부품"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">자동 채번</p>
              <p className="text-xs text-muted-foreground">부품 생성 시 품번을 자동으로 부여합니다</p>
            </div>
            <Switch
              checked={values.autoNumberingEnabled}
              onCheckedChange={(checked) => setValues({ ...values, autoNumberingEnabled: checked })}
            />
          </div>

          {values.autoNumberingEnabled ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nc-prefix">접두어</Label>
                  <Input
                    id="nc-prefix"
                    placeholder="예: MECH-"
                    maxLength={20}
                    value={values.formatPrefix}
                    onChange={(e) => setValues({ ...values, formatPrefix: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nc-suffix">접미어</Label>
                  <Input
                    id="nc-suffix"
                    placeholder="예: -A (선택)"
                    maxLength={20}
                    value={values.formatSuffix}
                    onChange={(e) => setValues({ ...values, formatSuffix: e.target.value })}
                  />
                </div>
              </div>

              <div className="w-1/2 space-y-1.5 pr-2">
                <Label htmlFor="nc-digits">자릿수</Label>
                <Input
                  id="nc-digits"
                  type="number"
                  min={1}
                  max={10}
                  value={values.digits}
                  onChange={(e) => setValues({ ...values, digits: clampDigits(Number(e.target.value) || 1) })}
                />
              </div>

              <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">미리보기</p>
                <p className="mt-0.5 font-mono text-sm font-medium text-foreground">
                  {buildPreview(values)}
                </p>
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            취소
          </Button>
          <Button disabled={!canSubmit} onClick={() => onSubmit(values)}>
            {isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
            {isEdit ? "수정" : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
