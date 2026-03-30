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
} from "@fabbit/ui";
import { Loader2 } from "lucide-react";
import type { NumberingCategoryModel } from "@/features/part-number-categories/types/numbering-categories.types";

interface NumberingCategoryFormValues {
  name: string;
  prefix: string;
  delimiter: string;
  digits: number;
}

const DEFAULT_VALUES: NumberingCategoryFormValues = {
  name: "",
  prefix: "",
  delimiter: "-",
  digits: 4,
};

function buildPreview(values: NumberingCategoryFormValues): string {
  const seq = "0".repeat(Math.max(1, values.digits - 1)) + "1";
  return `${values.prefix}${values.delimiter}${seq}`;
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
          prefix: editTarget.prefix,
          delimiter: editTarget.delimiter,
          digits: editTarget.digits,
        });
      } else {
        setValues(DEFAULT_VALUES);
      }
    }
  }, [open, editTarget]);

  const nameEmpty = values.name.trim() === "";
  const prefixEmpty = values.prefix.trim() === "";
  const digitsInvalid = values.digits < 1 || values.digits > 10;
  const canSubmit = !nameEmpty && !prefixEmpty && !digitsInvalid && !isPending;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "채번 규칙 수정" : "채번 규칙 추가"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "채번 규칙의 설정을 수정합니다."
              : "새로운 채번 규칙을 만들어 부품 생성 시 품번을 자동으로 부여하세요."}
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

          <div className="space-y-1.5">
            <Label htmlFor="nc-prefix">접두어</Label>
            <Input
              id="nc-prefix"
              placeholder="예: MECH"
              maxLength={20}
              value={values.prefix}
              onChange={(e) => setValues({ ...values, prefix: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nc-delimiter">구분자</Label>
              <Input
                id="nc-delimiter"
                placeholder="예: -"
                maxLength={5}
                value={values.delimiter}
                onChange={(e) => setValues({ ...values, delimiter: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nc-digits">자릿수</Label>
              <Input
                id="nc-digits"
                type="number"
                min={1}
                max={10}
                value={values.digits}
                onChange={(e) => setValues({ ...values, digits: Number(e.target.value) || 1 })}
              />
            </div>
          </div>

          {/* 미리보기 */}
          <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">미리보기</p>
            <p className="mt-0.5 font-mono text-sm font-medium text-foreground">
              {prefixEmpty ? "접두어를 입력하세요" : buildPreview(values)}
            </p>
          </div>
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
