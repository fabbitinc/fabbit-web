import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Badge,
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
import { PropertyMetaResponseOptionMode } from "@/api/generated/orval/model/propertyMetaResponseOptionMode";
import { PropertyMetaResponseValueType } from "@/api/generated/orval/model/propertyMetaResponseValueType";
import { useCreatePropertyDefinitionAction } from "@/features/properties/hooks/use-create-property-definition-action";
import { usePropertyMetaQuery } from "@/features/properties/hooks/use-property-meta-query";
import { useUpdatePropertyDefinitionAction } from "@/features/properties/hooks/use-update-property-definition-action";
import { useUpsertSystemPropertyOverrideAction } from "@/features/properties/hooks/use-upsert-system-property-override-action";
import { sortPropertyMeta } from "@/features/properties/lib/property-values";
import type {
  PropertyMetaModel,
  PropertyOptionMode,
  PropertyOptionModel,
  PropertyValueType,
} from "@/features/properties/types/properties-model";
import { toast } from "sonner";

interface PropertyOptionDraft {
  id: string;
  label: string;
  value: string;
}

interface CustomPropertyFormState {
  active: boolean;
  description: string;
  displayName: string;
  displayOrder: string;
  optionMode: PropertyOptionMode | "";
  options: PropertyOptionDraft[];
  required: boolean;
  valueType: PropertyValueType;
}

interface SystemOverrideFormState {
  active: boolean;
  displayNameOverride: string;
  displayOrder: string;
}

type DialogState =
  | { kind: "create-custom" }
  | { kind: "edit-custom"; meta: PropertyMetaModel }
  | { kind: "edit-system"; meta: PropertyMetaModel }
  | null;

const VALUE_TYPE_OPTIONS: PropertyValueType[] = Object.values(PropertyMetaResponseValueType);
const OPTION_MODE_OPTIONS: PropertyOptionMode[] = ["FIXED", "CREATABLE"];
let optionDraftSequence = 0;

function createDraftId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  optionDraftSequence += 1;
  return `property-option-${Date.now()}-${optionDraftSequence}`;
}

function createOptionDraft(option?: PropertyOptionModel): PropertyOptionDraft {
  return {
    id: createDraftId(),
    label: option?.label ?? "",
    value: option?.value ?? "",
  };
}

function createCustomPropertyFormState(meta?: PropertyMetaModel): CustomPropertyFormState {
  return {
    active: meta?.active ?? true,
    description: meta?.description ?? "",
    displayName: meta?.displayName ?? "",
    displayOrder: meta?.displayOrder != null ? String(meta.displayOrder) : "",
    optionMode: meta?.optionMode ?? "",
    options: meta?.options.length ? meta.options.map((option) => createOptionDraft(option)) : [createOptionDraft()],
    required: meta?.required ?? false,
    valueType: meta?.valueType ?? "STRING",
  };
}

function createSystemOverrideFormState(meta: PropertyMetaModel): SystemOverrideFormState {
  return {
    active: meta.active,
    displayNameOverride: meta.displayName,
    displayOrder: String(meta.displayOrder),
  };
}

function parseDisplayOrder(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error("표시 순서는 0 이상의 정수만 입력할 수 있습니다.");
  }

  return parsed;
}

function toPropertyOptionRequests(options: PropertyOptionDraft[]) {
  return options
    .map((option, index) => ({
      label: option.label.trim(),
      value: option.value.trim(),
      display_order: index,
      active: true,
    }))
    .filter((option) => option.label !== "" && option.value !== "");
}

function formatOptionSummary(meta: PropertyMetaModel) {
  if (meta.valueType !== "OPTION") {
    return "—";
  }

  const labels = meta.options.filter((option) => option.active).map((option) => option.label);
  const suffix = meta.optionMode ? ` (${meta.optionMode})` : "";

  return labels.length > 0 ? `${labels.join(", ")}${suffix}` : `옵션 없음${suffix}`;
}

export function OrganizationPartsPropertiesSection() {
  const propertyMetaQuery = usePropertyMetaQuery("PART", true);
  const createPropertyDefinitionAction = useCreatePropertyDefinitionAction();
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [customForm, setCustomForm] = useState<CustomPropertyFormState>(() => createCustomPropertyFormState());
  const [systemForm, setSystemForm] = useState<SystemOverrideFormState | null>(null);
  const updatePropertyDefinitionAction = useUpdatePropertyDefinitionAction();
  const upsertSystemOverrideAction = useUpsertSystemPropertyOverrideAction();

  const propertyMetas = useMemo(
    () => sortPropertyMeta(propertyMetaQuery.data ?? []),
    [propertyMetaQuery.data],
  );

  const dialogTitle =
    dialogState?.kind === "create-custom"
      ? "커스텀 속성 생성"
      : dialogState?.kind === "edit-custom"
        ? "커스텀 속성 수정"
        : "시스템 속성 설정 수정";

  const dialogDescription =
    dialogState?.kind === "edit-system"
      ? "시스템 속성은 표시명, 순서, 활성 여부만 조정할 수 있습니다."
      : "부품 화면에서 사용할 속성 메타를 관리합니다.";

  function openCreateDialog() {
    setCustomForm(createCustomPropertyFormState());
    setDialogState({ kind: "create-custom" });
  }

  function openEditCustomDialog(meta: PropertyMetaModel) {
    setCustomForm(createCustomPropertyFormState(meta));
    setDialogState({ kind: "edit-custom", meta });
  }

  function openEditSystemDialog(meta: PropertyMetaModel) {
    setSystemForm(createSystemOverrideFormState(meta));
    setDialogState({ kind: "edit-system", meta });
  }

  async function handleSubmit() {
    try {
      if (dialogState?.kind === "create-custom") {
        await createPropertyDefinitionAction.mutateAsync({
          owner_type: "PART",
          display_name: customForm.displayName.trim(),
          description: customForm.description.trim() || undefined,
          value_type: customForm.valueType,
          option_mode: customForm.valueType === "OPTION" ? customForm.optionMode || undefined : undefined,
          options: customForm.valueType === "OPTION" ? toPropertyOptionRequests(customForm.options) : undefined,
          display_order: parseDisplayOrder(customForm.displayOrder),
          required: customForm.required,
        });
        setDialogState(null);
        return;
      }

      if (dialogState?.kind === "edit-custom") {
        await updatePropertyDefinitionAction.mutateAsync({
          propertyDefinitionId: dialogState.meta.definitionId ?? "",
          request: {
            display_name: customForm.displayName.trim(),
            display_name_set: true,
            description: customForm.description.trim() || undefined,
            description_set: true,
            value_type: customForm.valueType,
            value_type_set: true,
            option_mode: customForm.valueType === "OPTION" ? customForm.optionMode || undefined : undefined,
            option_mode_set: customForm.valueType === "OPTION",
            options: customForm.valueType === "OPTION" ? toPropertyOptionRequests(customForm.options) : undefined,
            options_set: customForm.valueType === "OPTION",
            display_order: parseDisplayOrder(customForm.displayOrder),
            display_order_set: true,
            required: customForm.required,
            required_set: true,
            active: customForm.active,
            active_set: true,
          },
        });
        setDialogState(null);
        return;
      }

      if (dialogState?.kind === "edit-system" && systemForm) {
        await upsertSystemOverrideAction.mutateAsync({
          ownerType: dialogState.meta.ownerType || "PART",
          propertyKey: dialogState.meta.propertyKey,
          request: {
            display_name_override: systemForm.displayNameOverride.trim() || undefined,
            display_order: parseDisplayOrder(systemForm.displayOrder),
            active: systemForm.active,
          },
        });
        setDialogState(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "속성 저장에 실패했습니다.");
    }
  }

  const isCustomDialog = dialogState?.kind === "create-custom" || dialogState?.kind === "edit-custom";
  const isPending =
    createPropertyDefinitionAction.isPending ||
    updatePropertyDefinitionAction.isPending ||
    upsertSystemOverrideAction.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">부품 속성 관리</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            시스템 속성 override와 커스텀 속성을 관리합니다.
          </p>
        </div>
        <Button type="button" onClick={openCreateDialog}>
          <Plus className="mr-1.5 size-4" />
          커스텀 속성 추가
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">구분</th>
              <th className="px-4 py-3 text-left font-medium">표시명</th>
              <th className="px-4 py-3 text-left font-medium">타입</th>
              <th className="px-4 py-3 text-left font-medium">옵션</th>
              <th className="px-4 py-3 text-left font-medium">필수</th>
              <th className="px-4 py-3 text-left font-medium">활성</th>
              <th className="px-4 py-3 text-left font-medium">순서</th>
              <th className="w-12 px-4 py-3">
                <span className="sr-only">관리</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {propertyMetas.map((meta) => (
              <tr key={meta.propertyKey} className="border-t border-border/70 align-top">
                <td className="px-4 py-3">
                  <Badge variant={meta.system ? "secondary" : "outline"}>
                    {meta.system ? "시스템" : "커스텀"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{meta.displayName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {meta.propertyKey}
                  </div>
                  {meta.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{meta.valueType}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatOptionSummary(meta)}</td>
                <td className="px-4 py-3">{meta.required ? "예" : "아니오"}</td>
                <td className="px-4 py-3">{meta.active ? "사용" : "중지"}</td>
                <td className="px-4 py-3">{meta.displayOrder}</td>
                <td className="px-4 py-3">
                  <Button
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => (meta.system ? openEditSystemDialog(meta) : openEditCustomDialog(meta))}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {!propertyMetaQuery.isLoading && propertyMetas.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={8}>
                  등록된 속성이 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog
        open={dialogState !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          {isCustomDialog ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">표시명</label>
                  <Input
                    value={customForm.displayName}
                    onChange={(event) =>
                      setCustomForm((current) => ({ ...current, displayName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">표시 순서</label>
                  <Input
                    inputMode="numeric"
                    value={customForm.displayOrder}
                    onChange={(event) =>
                      setCustomForm((current) => ({ ...current, displayOrder: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">설명</label>
                <Textarea
                  value={customForm.description}
                  onChange={(event) =>
                    setCustomForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">값 타입</label>
                  <Select
                    value={customForm.valueType}
                    onValueChange={(value) =>
                      setCustomForm((current) => ({
                        ...current,
                        valueType: value as PropertyValueType,
                        optionMode:
                          value === "OPTION" ? current.optionMode || PropertyMetaResponseOptionMode.FIXED : "",
                        options:
                          value === "OPTION"
                            ? current.options.length > 0
                              ? current.options
                              : [createOptionDraft()]
                            : current.options,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALUE_TYPE_OPTIONS.map((valueType) => (
                        <SelectItem key={valueType} value={valueType}>
                          {valueType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {customForm.valueType === "OPTION" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">옵션 입력 모드</label>
                    <Select
                      value={customForm.optionMode || PropertyMetaResponseOptionMode.FIXED}
                      onValueChange={(value) =>
                        setCustomForm((current) => ({
                          ...current,
                          optionMode: value as PropertyOptionMode,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPTION_MODE_OPTIONS.map((optionMode) => (
                          <SelectItem key={optionMode} value={optionMode}>
                            {optionMode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">필수 여부</div>
                    <div className="text-xs text-muted-foreground">부품 화면에서 필수 입력으로 표시합니다.</div>
                  </div>
                  <Switch
                    checked={customForm.required}
                    onCheckedChange={(checked) =>
                      setCustomForm((current) => ({ ...current, required: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">활성 여부</div>
                    <div className="text-xs text-muted-foreground">비활성 속성은 편집 메타에서 제외됩니다.</div>
                  </div>
                  <Switch
                    checked={customForm.active}
                    onCheckedChange={(checked) =>
                      setCustomForm((current) => ({ ...current, active: checked }))
                    }
                  />
                </div>
              </div>

              {customForm.valueType === "OPTION" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">옵션 목록</h3>
                      <p className="text-xs text-muted-foreground">고정 옵션 또는 생성 가능 옵션 후보를 관리합니다.</p>
                    </div>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setCustomForm((current) => ({
                          ...current,
                          options: [...current.options, createOptionDraft()],
                        }))
                      }
                    >
                      <Plus className="mr-1.5 size-4" />
                      옵션 추가
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {customForm.options.map((option) => (
                      <div key={option.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <Input
                          placeholder="옵션 표시명"
                          value={option.label}
                          onChange={(event) =>
                            setCustomForm((current) => ({
                              ...current,
                              options: current.options.map((item) =>
                                item.id === option.id ? { ...item, label: event.target.value } : item,
                              ),
                            }))
                          }
                        />
                        <Input
                          placeholder="옵션 값"
                          value={option.value}
                          onChange={(event) =>
                            setCustomForm((current) => ({
                              ...current,
                              options: current.options.map((item) =>
                                item.id === option.id ? { ...item, value: event.target.value } : item,
                              ),
                            }))
                          }
                        />
                        <Button
                          size="icon"
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setCustomForm((current) => ({
                              ...current,
                              options:
                                current.options.length > 1
                                  ? current.options.filter((item) => item.id !== option.id)
                                  : [createOptionDraft()],
                            }))
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : systemForm ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">표시명 override</label>
                <Input
                  value={systemForm.displayNameOverride}
                  onChange={(event) =>
                    setSystemForm((current) =>
                      current ? { ...current, displayNameOverride: event.target.value } : current,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">표시 순서</label>
                <Input
                  inputMode="numeric"
                  value={systemForm.displayOrder}
                  onChange={(event) =>
                    setSystemForm((current) =>
                      current ? { ...current, displayOrder: event.target.value } : current,
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-foreground">활성 여부</div>
                  <div className="text-xs text-muted-foreground">비활성으로 바꾸면 부품 화면에서 숨길 수 있습니다.</div>
                </div>
                <Switch
                  checked={systemForm.active}
                  onCheckedChange={(checked) =>
                    setSystemForm((current) => (current ? { ...current, active: checked } : current))
                  }
                />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogState(null)}>
              취소
            </Button>
            <Button
              disabled={
                isPending ||
                (isCustomDialog
                  ? customForm.displayName.trim() === ""
                  : systemForm == null)
              }
              onClick={() => {
                void handleSubmit();
              }}
            >
              {isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
