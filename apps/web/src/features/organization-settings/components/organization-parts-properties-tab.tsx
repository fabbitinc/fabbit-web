import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
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
import {
  useCreatePropertyDefinitionAction,
  usePropertyMetaQuery,
  useUpdatePropertyDefinitionAction,
  useUpsertSystemPropertyOverrideAction,
  type PropertyMetaModel,
  type PropertyOptionMode,
  type PropertyValueType,
} from "@/features/properties";

type PropertyOptionDraft = {
  active: boolean;
  displayOrder: string;
  label: string;
  value: string;
};

interface CustomPropertyDraft {
  active: boolean;
  description: string;
  displayName: string;
  displayOrder: string;
  optionMode: PropertyOptionMode;
  options: PropertyOptionDraft[];
  required: boolean;
  valueType: PropertyValueType;
}

interface SystemOverrideDraft {
  active: boolean;
  activeConfigurable: boolean;
  displayNameOverride: string;
  displayOrder: string;
}

const PROPERTY_OWNER_TYPE = "PART";
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

function createEmptyOptionDraft(): PropertyOptionDraft {
  return {
    active: true,
    displayOrder: "",
    label: "",
    value: "",
  };
}

function createInitialCustomPropertyDraft(): CustomPropertyDraft {
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

function toCustomPropertyDraft(property: PropertyMetaModel): CustomPropertyDraft {
  return {
    active: property.active,
    description: property.description ?? "",
    displayName: property.displayName,
    displayOrder: String(property.displayOrder ?? 0),
    optionMode: property.optionMode ?? "FIXED",
    options:
      property.options.length > 0
        ? property.options
            .sort((left, right) => left.displayOrder - right.displayOrder)
            .map((option) => ({
              active: option.active,
              displayOrder: String(option.displayOrder),
              label: option.label,
              value: option.value,
            }))
        : [createEmptyOptionDraft()],
    required: property.required,
    valueType: property.valueType,
  };
}

function toSystemOverrideDraft(property: PropertyMetaModel): SystemOverrideDraft {
  return {
    active: property.active,
    activeConfigurable: property.activeConfigurable,
    displayNameOverride: property.displayName,
    displayOrder: String(property.displayOrder ?? 0),
  };
}

function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function toRequiredString(value: string, label: string) {
  const trimmed = value.trim();

  if (trimmed === "") {
    throw new Error(`${label}을(를) 입력해 주세요.`);
  }

  return trimmed;
}

function toOptionalDisplayOrder(value: string) {
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
    .filter((option) => option.label.trim() !== "" || option.value.trim() !== "")
    .map((option) => ({
      active: option.active,
      display_order: toOptionalDisplayOrder(option.displayOrder),
      label: toRequiredString(option.label, "옵션 표시명"),
      value: toRequiredString(option.value, "옵션 값"),
    }));
}

function formatValueType(valueType: PropertyValueType) {
  return VALUE_TYPE_OPTIONS.find((option) => option.value === valueType)?.label ?? valueType;
}

function formatOptionMode(optionMode: PropertyOptionMode | null) {
  if (!optionMode) {
    return "—";
  }

  return OPTION_MODE_OPTIONS.find((option) => option.value === optionMode)?.label ?? optionMode;
}

function sortProperties(left: PropertyMetaModel, right: PropertyMetaModel) {
  if (left.displayOrder !== right.displayOrder) {
    return left.displayOrder - right.displayOrder;
  }

  if (left.system !== right.system) {
    return left.system ? -1 : 1;
  }

  return left.displayName.localeCompare(right.displayName, "ko");
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

function CustomPropertyDialog({
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
                onChange={(event) =>
                  onDraftChange({ ...draft, displayName: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">표시 순서</label>
              <Input
                inputMode="numeric"
                value={draft.displayOrder}
                onChange={(event) =>
                  onDraftChange({ ...draft, displayOrder: event.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">설명</label>
            <Textarea
              value={draft.description}
              onChange={(event) =>
                onDraftChange({ ...draft, description: event.target.value })
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">입력 형식</label>
              <Select
                value={draft.valueType}
                onValueChange={(value) =>
                  onDraftChange({
                    ...draft,
                    optionMode: value === "OPTION" ? draft.optionMode : "FIXED",
                    options: value === "OPTION" ? draft.options : [createEmptyOptionDraft()],
                    valueType: value as PropertyValueType,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VALUE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isOptionType ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">선택값 입력 방식</label>
                <Select
                  value={draft.optionMode}
                  onValueChange={(value) =>
                    onDraftChange({
                      ...draft,
                      optionMode: value as PropertyOptionMode,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPTION_MODE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
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
              <Switch
                checked={draft.required}
                onCheckedChange={(checked) =>
                  onDraftChange({ ...draft, required: checked })
                }
              />
            </div>

            {mode === "edit" ? (
              <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">사용 여부</p>
                  <p className="text-xs text-muted-foreground">사용 안 함으로 바꾸면 부품 화면에서 숨겨집니다.</p>
                </div>
                <Switch
                  checked={draft.active}
                  onCheckedChange={(checked) =>
                    onDraftChange({ ...draft, active: checked })
                  }
                />
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
                  onClick={() =>
                    onDraftChange({
                      ...draft,
                      options: [...draft.options, createEmptyOptionDraft()],
                    })
                  }
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
                      onChange={(event) =>
                        onDraftChange({
                          ...draft,
                          options: draft.options.map((current, currentIndex) =>
                            currentIndex === index
                              ? { ...current, value: event.target.value }
                              : current,
                          ),
                        })
                      }
                    />
                    <Input
                      placeholder="표시명"
                      value={option.label}
                      onChange={(event) =>
                        onDraftChange({
                          ...draft,
                          options: draft.options.map((current, currentIndex) =>
                            currentIndex === index
                              ? { ...current, label: event.target.value }
                              : current,
                          ),
                        })
                      }
                    />
                    <Input
                      inputMode="numeric"
                      placeholder="순서"
                      value={option.displayOrder}
                      onChange={(event) =>
                        onDraftChange({
                          ...draft,
                          options: draft.options.map((current, currentIndex) =>
                            currentIndex === index
                              ? { ...current, displayOrder: event.target.value }
                              : current,
                          ),
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
                            options: draft.options.map((current, currentIndex) =>
                              currentIndex === index
                                ? { ...current, active: checked }
                                : current,
                            ),
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
                          options:
                            draft.options.length === 1
                              ? [createEmptyOptionDraft()]
                              : draft.options.filter((_, currentIndex) => currentIndex !== index),
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
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="button" disabled={isPending} onClick={onSubmit}>
            {isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SystemOverrideDialogProps {
  draft: SystemOverrideDraft;
  isPending: boolean;
  open: boolean;
  onClose: () => void;
  onDraftChange: (draft: SystemOverrideDraft) => void;
  onSubmit: () => void;
}

function SystemOverrideDialog({
  draft,
  isPending,
  open,
  onClose,
  onDraftChange,
  onSubmit,
}: SystemOverrideDialogProps) {
  const canConfigureActive = draft.activeConfigurable;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>기본 항목 표시 설정</DialogTitle>
          <DialogDescription>
            기본으로 제공되는 항목입니다. 항목 이름, 보이는 순서{canConfigureActive ? ", 사용 여부" : ""}를 설정합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">화면 표시명</label>
            <Input
              value={draft.displayNameOverride}
              onChange={(event) =>
                onDraftChange({ ...draft, displayNameOverride: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">표시 순서</label>
            <Input
              inputMode="numeric"
              value={draft.displayOrder}
              onChange={(event) =>
                onDraftChange({ ...draft, displayOrder: event.target.value })
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">사용 여부</p>
              <p className="text-xs text-muted-foreground">
                {canConfigureActive
                  ? "사용 안 함으로 바꾸면 부품 화면에서 숨겨집니다."
                  : "이 기본 항목은 조직 설정에서 사용 여부를 변경할 수 없습니다."}
              </p>
            </div>
            <Switch
              checked={draft.active}
              disabled={!canConfigureActive}
              onCheckedChange={(checked) => onDraftChange({ ...draft, active: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="button" disabled={isPending} onClick={onSubmit}>
            {isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OrganizationPartsPropertiesTab() {
  const propertyMetaQuery = usePropertyMetaQuery(PROPERTY_OWNER_TYPE, true);
  const createPropertyDefinitionAction = useCreatePropertyDefinitionAction();
  const updatePropertyDefinitionAction = useUpdatePropertyDefinitionAction();
  const upsertSystemPropertyOverrideAction = useUpsertSystemPropertyOverrideAction();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<CustomPropertyDraft>(createInitialCustomPropertyDraft());
  const [editingCustomProperty, setEditingCustomProperty] = useState<PropertyMetaModel | null>(null);
  const [editingCustomDraft, setEditingCustomDraft] = useState<CustomPropertyDraft>(createInitialCustomPropertyDraft());
  const [editingSystemProperty, setEditingSystemProperty] = useState<PropertyMetaModel | null>(null);
  const [editingSystemDraft, setEditingSystemDraft] = useState<SystemOverrideDraft>({
    active: true,
    activeConfigurable: true,
    displayNameOverride: "",
    displayOrder: "",
  });

  const properties = useMemo(
    () => [...(propertyMetaQuery.data ?? [])].sort(sortProperties),
    [propertyMetaQuery.data],
  );

  function handleCreateSubmit() {
    createPropertyDefinitionAction.mutate(
      {
        owner_type: PROPERTY_OWNER_TYPE,
        display_name: toRequiredString(createDraft.displayName, "표시명"),
        description: toOptionalString(createDraft.description),
        value_type: createDraft.valueType,
        option_mode: createDraft.valueType === "OPTION" ? createDraft.optionMode : undefined,
        options: createDraft.valueType === "OPTION" ? toPropertyOptionRequests(createDraft.options) : undefined,
        display_order: toOptionalDisplayOrder(createDraft.displayOrder),
        required: createDraft.required,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setCreateDraft(createInitialCustomPropertyDraft());
        },
      },
    );
  }

  function handleCustomUpdateSubmit() {
    if (!editingCustomProperty?.definitionId) {
      return;
    }

    updatePropertyDefinitionAction.mutate(
      {
        propertyDefinitionId: editingCustomProperty.definitionId,
        request: {
          display_name: toRequiredString(editingCustomDraft.displayName, "표시명"),
          display_name_set: true,
          description: toOptionalString(editingCustomDraft.description),
          description_set: true,
          value_type: editingCustomDraft.valueType,
          value_type_set: true,
          option_mode: editingCustomDraft.valueType === "OPTION" ? editingCustomDraft.optionMode : undefined,
          option_mode_set: true,
          options: editingCustomDraft.valueType === "OPTION" ? toPropertyOptionRequests(editingCustomDraft.options) : [],
          options_set: true,
          display_order: toOptionalDisplayOrder(editingCustomDraft.displayOrder),
          display_order_set: true,
          required: editingCustomDraft.required,
          required_set: true,
          active: editingCustomDraft.active,
          active_set: true,
        },
      },
      {
        onSuccess: () => {
          setEditingCustomProperty(null);
        },
      },
    );
  }

  function handleSystemOverrideSubmit() {
    if (!editingSystemProperty) {
      return;
    }

    upsertSystemPropertyOverrideAction.mutate(
      {
        ownerType: PROPERTY_OWNER_TYPE,
        propertyKey: editingSystemProperty.propertyKey,
        request: {
          display_name_override: editingSystemDraft.displayNameOverride.trim(),
          display_order: toOptionalDisplayOrder(editingSystemDraft.displayOrder),
          active: editingSystemDraft.activeConfigurable ? editingSystemDraft.active : undefined,
        },
      },
      {
        onSuccess: () => {
          setEditingSystemProperty(null);
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">부품 항목 관리</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            기본 항목의 이름과 표시 순서를 바꾸고, 회사에서 쓰는 추가 항목을 관리합니다.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setCreateDraft(createInitialCustomPropertyDraft());
            setIsCreateOpen(true);
          }}
        >
          <Plus className="mr-1.5 size-4" />
          사용자 정의 항목 추가
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">항목</th>
              <th className="px-4 py-3 text-left font-medium">구분</th>
              <th className="px-4 py-3 text-left font-medium">입력 형식</th>
              <th className="px-4 py-3 text-left font-medium">입력 방식</th>
              <th className="px-4 py-3 text-left font-medium">필수</th>
              <th className="px-4 py-3 text-left font-medium">사용 여부</th>
              <th className="px-4 py-3 text-left font-medium">순서</th>
              <th className="w-14 px-4 py-3 text-right">
                <span className="sr-only">관리</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.propertyKey} className="border-t border-border/70 align-top">
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{property.displayName}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{property.propertyKey}</p>
                    {property.description ? (
                      <p className="text-xs text-muted-foreground">{property.description}</p>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={property.system ? "secondary" : "outline"}>
                    {property.system ? "기본 항목" : "사용자 정의"}
                  </Badge>
                </td>
                <td className="px-4 py-3">{formatValueType(property.valueType)}</td>
                <td className="px-4 py-3">{property.valueType === "OPTION" ? formatOptionMode(property.optionMode) : "—"}</td>
                <td className="px-4 py-3">{property.required ? "필수" : "선택"}</td>
                <td className="px-4 py-3">
                  <Badge variant={property.active ? "success" : "outline"}>
                    {property.active ? "사용 중" : "사용 안 함"}
                  </Badge>
                </td>
                <td className="px-4 py-3">{property.displayOrder}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      if (property.system) {
                        setEditingSystemProperty(property);
                        setEditingSystemDraft(toSystemOverrideDraft(property));
                        return;
                      }

                      setEditingCustomProperty(property);
                      setEditingCustomDraft(toCustomPropertyDraft(property));
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {properties.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={8}>
                  {propertyMetaQuery.isLoading ? "항목 정보를 불러오는 중입니다." : "등록된 항목이 없습니다."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <CustomPropertyDialog
        draft={createDraft}
        isPending={createPropertyDefinitionAction.isPending}
        mode="create"
        open={isCreateOpen}
        title="사용자 정의 항목 추가"
        onClose={() => setIsCreateOpen(false)}
        onDraftChange={setCreateDraft}
        onSubmit={handleCreateSubmit}
      />

      <CustomPropertyDialog
        draft={editingCustomDraft}
        isPending={updatePropertyDefinitionAction.isPending}
        mode="edit"
        open={editingCustomProperty !== null}
        title="사용자 정의 항목 편집"
        onClose={() => setEditingCustomProperty(null)}
        onDraftChange={setEditingCustomDraft}
        onSubmit={handleCustomUpdateSubmit}
      />

      <SystemOverrideDialog
        draft={editingSystemDraft}
        isPending={upsertSystemPropertyOverrideAction.isPending}
        open={editingSystemProperty !== null}
        onClose={() => setEditingSystemProperty(null)}
        onDraftChange={setEditingSystemDraft}
        onSubmit={handleSystemOverrideSubmit}
      />
    </div>
  );
}
