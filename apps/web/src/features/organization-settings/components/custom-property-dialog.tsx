import { Loader2, Plus } from "lucide-react";
import {
  Button,
  Dialog,
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
  Switch,
  Textarea,
} from "@fabbit/ui";
import type { PropertyMetaModel, PropertyOptionMode, PropertyValueType } from "@/features/properties";

export type PropertyOptionDraft = {
  active: boolean;
  displayOrder: string;
  label: string;
  value: string;
};

export interface CustomPropertyDraft {
  active: boolean;
  description: string;
  displayName: string;
  displayOrder: string;
  optionMode: PropertyOptionMode;
  options: PropertyOptionDraft[];
  required: boolean;
  valueType: PropertyValueType;
}

const VALUE_TYPE_OPTIONS: Array<{ label: string; value: PropertyValueType }> = [
  { value: "STRING", label: "문자열" },
  { value: "INTEGER", label: "정수" },
  { value: "FLOAT", label: "실수" },
  { value: "BOOLEAN", label: "예/아니오" },
  { value: "OPTION", label: "선택값" },
];

const OPTION_MODE_OPTIONS: Array<{ label: string; value: PropertyOptionMode }> = [
  { value: "FIXED", label: "목록에서만 선택" },
  { value: "CREATABLE", label: "직접 입력 허용" },
];

export function createEmptyOptionDraft(): PropertyOptionDraft {
  return { active: true, displayOrder: "", label: "", value: "" };
}

export function createInitialCustomPropertyDraft(): CustomPropertyDraft {
  return {
    active: true,
    description: "",
    displayName: "",
    displayOrder: "",
    optionMode: "FIXED",
    options: [createEmptyOptionDraft()],
    required: false,
    valueType: "STRING",
  };
}

export function toCustomPropertyDraft(property: PropertyMetaModel): CustomPropertyDraft {
  return {
    active: property.active,
    description: property.description ?? "",
    displayName: property.displayName,
    displayOrder: String(property.displayOrder ?? 0),
    optionMode: property.optionMode ?? "FIXED",
    options:
      property.options.length > 0
        ? property.options
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((o) => ({
              active: o.active,
              displayOrder: String(o.displayOrder),
              label: o.label,
              value: o.value,
            }))
        : [createEmptyOptionDraft()],
    required: property.required,
    valueType: property.valueType,
  };
}

export function formatValueType(valueType: PropertyValueType) {
  return VALUE_TYPE_OPTIONS.find((o) => o.value === valueType)?.label ?? valueType;
}

export function formatOptionMode(optionMode: PropertyOptionMode | null) {
  if (!optionMode) return "—";
  return OPTION_MODE_OPTIONS.find((o) => o.value === optionMode)?.label ?? optionMode;
}

export function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function toRequiredString(value: string, label: string) {
  const trimmed = value.trim();
  if (trimmed === "") throw new Error(`${label}을(를) 입력해 주세요.`);
  return trimmed;
}

export function toOptionalDisplayOrder(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error("표시 순서는 0 이상의 정수만 입력할 수 있습니다.");
  }
  return parsed;
}

export function toPropertyOptionRequests(options: PropertyOptionDraft[]) {
  return options
    .filter((o) => o.label.trim() !== "" || o.value.trim() !== "")
    .map((o) => ({
      active: o.active,
      display_order: toOptionalDisplayOrder(o.displayOrder),
      label: toRequiredString(o.label, "옵션 표시명"),
      value: toRequiredString(o.value, "옵션 값"),
    }));
}

interface CustomPropertyDialogProps {
  draft: CustomPropertyDraft;
  isPending: boolean;
  mode: "create" | "edit";
  open: boolean;
  title: string;
  onClose: () => void;
  onDraftChange: (draft: CustomPropertyDraft) => void;
  onSubmit: () => void;
}

export function CustomPropertyDialog({
  draft,
  isPending,
  mode,
  open,
  title,
  onClose,
  onDraftChange,
  onSubmit,
}: CustomPropertyDialogProps) {
  const isOptionType = draft.valueType === "OPTION";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            회사에서 추가로 사용할 항목을 만들고 입력 방식과 선택값을 설정합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">표시명</label>
              <Input
                value={draft.displayName}
                onChange={(e) => onDraftChange({ ...draft, displayName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">표시 순서</label>
              <Input
                inputMode="numeric"
                value={draft.displayOrder}
                onChange={(e) => onDraftChange({ ...draft, displayOrder: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">설명</label>
            <Textarea
              value={draft.description}
              onChange={(e) => onDraftChange({ ...draft, description: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">입력 형식</label>
              <Select
                value={draft.valueType}
                onValueChange={(v) =>
                  onDraftChange({
                    ...draft,
                    optionMode: v === "OPTION" ? draft.optionMode : "FIXED",
                    options: v === "OPTION" ? draft.options : [createEmptyOptionDraft()],
                    valueType: v as PropertyValueType,
                  })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VALUE_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isOptionType ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">선택값 입력 방식</label>
                <Select
                  value={draft.optionMode}
                  onValueChange={(v) => onDraftChange({ ...draft, optionMode: v as PropertyOptionMode })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OPTION_MODE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-foreground">필수 여부</p>
                <p className="text-xs text-muted-foreground">부품 화면에서 필수 입력으로 안내합니다.</p>
              </div>
              <Switch checked={draft.required} onCheckedChange={(c) => onDraftChange({ ...draft, required: c })} />
            </div>
            {mode === "edit" ? (
              <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">사용 여부</p>
                  <p className="text-xs text-muted-foreground">사용 안 함으로 바꾸면 부품 화면에서 숨겨집니다.</p>
                </div>
                <Switch checked={draft.active} onCheckedChange={(c) => onDraftChange({ ...draft, active: c })} />
              </div>
            ) : null}
          </div>

          {isOptionType ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">선택값 목록</h3>
                  <p className="text-xs text-muted-foreground">목록에서 고를 값과 직접 입력 허용 여부를 함께 설정합니다.</p>
                </div>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => onDraftChange({ ...draft, options: [...draft.options, createEmptyOptionDraft()] })}
                >
                  <Plus className="mr-1 size-3.5" />
                  선택값 추가
                </Button>
              </div>
              <div className="space-y-2">
                {draft.options.map((option, index) => (
                  <div
                    key={`${index}-${option.value}-${option.label}`}
                    className="grid gap-2 rounded-lg border border-border/70 p-3 md:grid-cols-[1fr_1fr_120px_auto_auto]"
                  >
                    <Input
                      placeholder="저장 값"
                      value={option.value}
                      onChange={(e) =>
                        onDraftChange({
                          ...draft,
                          options: draft.options.map((c, i) => (i === index ? { ...c, value: e.target.value } : c)),
                        })
                      }
                    />
                    <Input
                      placeholder="표시명"
                      value={option.label}
                      onChange={(e) =>
                        onDraftChange({
                          ...draft,
                          options: draft.options.map((c, i) => (i === index ? { ...c, label: e.target.value } : c)),
                        })
                      }
                    />
                    <Input
                      inputMode="numeric"
                      placeholder="순서"
                      value={option.displayOrder}
                      onChange={(e) =>
                        onDraftChange({
                          ...draft,
                          options: draft.options.map((c, i) => (i === index ? { ...c, displayOrder: e.target.value } : c)),
                        })
                      }
                    />
                    <div className="flex items-center justify-between rounded-md border border-border/70 px-3">
                      <span className="text-xs text-muted-foreground">사용</span>
                      <Switch
                        checked={option.active}
                        onCheckedChange={(checked) =>
                          onDraftChange({
                            ...draft,
                            options: draft.options.map((c, i) => (i === index ? { ...c, active: checked } : c)),
                          })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        onDraftChange({
                          ...draft,
                          options: draft.options.length === 1
                            ? [createEmptyOptionDraft()]
                            : draft.options.filter((_, i) => i !== index),
                        })
                      }
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>취소</Button>
          <Button type="button" disabled={isPending} onClick={onSubmit}>
            {isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
