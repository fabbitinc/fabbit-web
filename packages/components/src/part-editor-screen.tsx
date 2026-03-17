import {
  ArrowLeft,
  Building2,
  Check,
  ChevronsUpDown,
  Clock,
  FolderKanban,
  Network,
  Package,
  PencilLine,
  Paperclip,
} from "lucide-react";
import { type ComponentType, useState } from "react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectEmptyState,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  cn,
} from "@fabbit/ui";
import {
  PartDrawingPreview,
  type PartDrawingPreviewDrawing,
} from "./part-drawing-preview";
import { PartPropertiesTable } from "./part-properties-table";

export interface PartEditorScreenOption {
  value: string;
  label: string;
}

export interface PartEditorScreenExtendedField {
  helperText?: string;
  id: string;
  label: string;
  placeholder?: string;
  value: string;
}

export interface PartEditorScreenDrawingSummary {
  drawingNumber: string | null;
  name: string | null;
  revision: string | null;
  version: string | null;
  status: string | null;
  conversionStatus: string | null;
  viewerType: "PDF" | "GLB" | null;
  viewerUrl: string | null;
  previewUrl: string | null;
  originalFileUrl: string | null;
  failureMessage?: string | null;
  webViewRequirement?: {
    title: string;
    description?: string | null;
  } | null;
}

export interface PartEditorScreenReferenceStats {
  attachments: number;
  childParts: number;
  linkedProjects: number;
  linkedSuppliers: number;
}

export interface PartEditorScreenFormValues {
  category: string | null;
  description: string;
  isPhantom: boolean;
  leadTimeDays: string;
  lifecycleState: string | null;
  material: string;
  name: string;
  partNumber: string;
  revision: string;
  unit: string | null;
}

export interface PartEditorScreenProps {
  backLabel?: string;
  categoryOptions: PartEditorScreenOption[];
  description?: string;
  drawing?: PartEditorScreenDrawingSummary | null;
  extendedFields?: PartEditorScreenExtendedField[];
  formValues: PartEditorScreenFormValues;
  heading?: string;
  isSubmitting?: boolean;
  lastSavedLabel?: string;
  lifecycleOptions: PartEditorScreenOption[];
  lockedFields?: {
    lifecycleState?: boolean;
    partNumber?: boolean;
    revision?: boolean;
  };
  mode: "create" | "edit";
  onBack: () => void;
  onChange: (values: PartEditorScreenFormValues) => void;
  onExtendedFieldsChange?: (fields: PartEditorScreenExtendedField[]) => void;
  onSaveDraft?: () => void;
  onSubmit: () => void;
  onOpenDrawingViewer?: (drawing: PartDrawingPreviewDrawing) => void;
  referenceStats?: PartEditorScreenReferenceStats;
  saveDraftLabel?: string;
  submitLabel?: string;
  unitOptions: PartEditorScreenOption[];
}

interface EditorTabItem {
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value?: number | null;
}

interface CategoryComboboxProps {
  className?: string;
  options: PartEditorScreenOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

function CategoryCombobox({ className, options, value, onChange }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const displayValue = value ?? "";
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );
  const hasExactMatch = options.some((o) => o.value === search);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            className,
            "flex w-full items-center justify-between text-left",
            !displayValue && "text-muted-foreground",
          )}
        >
          <span className="truncate">{displayValue || "카테고리를 선택하거나 입력하세요"}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="검색 또는 직접 입력"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filtered.length === 0 && !search.trim() ? (
              <CommandEmpty>등록된 카테고리가 없습니다.</CommandEmpty>
            ) : null}
            {search.trim() && !hasExactMatch ? (
              <CommandGroup heading="직접 입력">
                <CommandItem
                  value={`__custom__${search}`}
                  onSelect={() => {
                    onChange(search.trim());
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span>&ldquo;{search.trim()}&rdquo; 추가</span>
                </CommandItem>
              </CommandGroup>
            ) : null}
            {filtered.length > 0 ? (
              <CommandGroup heading="카테고리">
                {filtered.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onChange(option.value === value ? null : option.value);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function PartEditorScreen({
  backLabel = "부품 관리",
  categoryOptions,
  description,
  drawing,
  extendedFields = [],
  formValues,
  heading,
  isSubmitting = false,
  lastSavedLabel,
  lifecycleOptions,
  lockedFields,
  mode,
  onBack,
  onChange,
  onExtendedFieldsChange,
  onOpenDrawingViewer,
  onSaveDraft,
  onSubmit,
  saveDraftLabel,
  submitLabel,
  unitOptions,
}: PartEditorScreenProps) {
  const createBreadcrumbLabel = heading ?? "새 부품";
  const primaryLabel =
    submitLabel ?? (mode === "create" ? "부품 생성" : "변경 저장");
  const secondaryLabel =
    saveDraftLabel ?? (mode === "create" ? "초안 저장" : "임시 저장");
  const [submitted, setSubmitted] = useState(false);
  const partNumberEmpty = formValues.partNumber.trim() === "";
  const revisionLabel =
    mode === "create" ? "자동 부여" : formValues.revision.trim() || "미정";
  const headerDescription =
    formValues.description.trim() || description?.trim() || "";
  const showDrawingPreview = mode === "edit";
  const tableFieldClassName =
    "h-8 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs";
  const tableSelectTriggerClassName =
    "h-8 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs";
  const tableTextareaClassName =
    "min-h-24 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm shadow-xs";
  const editorTabs: EditorTabItem[] = [
    { id: "properties", icon: Package, label: "속성" },
    { id: "bom", icon: Network, label: "BOM" },
    { id: "attachments", icon: Paperclip, label: "파일" },
    { id: "suppliers", icon: Building2, label: "공급사" },
    { id: "projects", icon: FolderKanban, label: "프로젝트" },
    { id: "history", icon: Clock, label: "이력" },
  ];
  const tableRows = [
    {
      error: submitted && partNumberEmpty ? "품번을 입력해 주세요." : undefined,
      label: "품번",
      value: lockedFields?.partNumber ? (
        <span className="font-mono text-xs">{formValues.partNumber}</span>
      ) : (
        <Input
          className={tableFieldClassName}
          id="part-editor-part-number"
          placeholder="예: DRV-BASE-0142"
          value={formValues.partNumber}
          onChange={(event) =>
            onChange({ ...formValues, partNumber: event.target.value })
          }
        />
      ),
    },
    {
      label: "품명",
      value: (
        <Input
          className={tableFieldClassName}
          id="part-editor-name"
          placeholder="예: 드라이브 유닛 베이스 플레이트"
          value={formValues.name}
          onChange={(event) =>
            onChange({ ...formValues, name: event.target.value })
          }
        />
      ),
    },
    {
      label: "리비전",
      value:
        mode === "create" ? (
          <span className="text-sm text-muted-foreground">생성 시 자동 부여</span>
        ) : lockedFields?.revision ? (
          <span className="text-sm">{formValues.revision || <span className="text-muted-foreground/40">—</span>}</span>
        ) : (
          <Input
            className={tableFieldClassName}
            id="part-editor-revision"
            placeholder="예: B"
            value={formValues.revision}
            onChange={(event) =>
              onChange({ ...formValues, revision: event.target.value })
            }
          />
        ),
    },
    {
      label: "상태",
      value: lockedFields?.lifecycleState ? (
        <span className="text-sm">
          {lifecycleOptions.find((o) => o.value === formValues.lifecycleState)?.label
            ?? formValues.lifecycleState
            ?? <span className="text-muted-foreground/40">—</span>}
        </span>
      ) : (
        <Select
          value={formValues.lifecycleState ?? undefined}
          onValueChange={(value) =>
            onChange({ ...formValues, lifecycleState: value })
          }
        >
          <SelectTrigger className={tableSelectTriggerClassName}>
            <SelectValue placeholder="상태를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {lifecycleOptions.length > 0 ? (
              lifecycleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <SelectEmptyState>표시할 상태 옵션이 없습니다.</SelectEmptyState>
            )}
          </SelectContent>
        </Select>
      ),
    },
    {
      label: "카테고리",
      value: (
        <CategoryCombobox
          className={tableFieldClassName}
          options={categoryOptions}
          value={formValues.category}
          onChange={(value) => onChange({ ...formValues, category: value })}
        />
      ),
    },
    {
      label: "재질",
      value: (
        <Input
          className={tableFieldClassName}
          id="part-editor-material"
          placeholder="예: AL6061-T6"
          value={formValues.material}
          onChange={(event) =>
            onChange({ ...formValues, material: event.target.value })
          }
        />
      ),
    },
    {
      label: "단위",
      value: (
        <Select
          value={formValues.unit ?? undefined}
          onValueChange={(value) => onChange({ ...formValues, unit: value })}
        >
          <SelectTrigger className={tableSelectTriggerClassName}>
            <SelectValue placeholder="단위를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {unitOptions.length > 0 ? (
              unitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <SelectEmptyState>표시할 단위가 없습니다.</SelectEmptyState>
            )}
          </SelectContent>
        </Select>
      ),
    },
    {
      label: "리드타임",
      value: (
        <Input
          className={tableFieldClassName}
          id="part-editor-lead-time"
          inputMode="numeric"
          placeholder="예: 14"
          value={formValues.leadTimeDays}
          onChange={(event) =>
            onChange({ ...formValues, leadTimeDays: event.target.value })
          }
        />
      ),
    },
    {
      label: "팬텀",
      value: (
        <div className="flex min-h-8 items-center justify-between gap-3">
          <span className="text-sm text-foreground">
            상위 조립 계산에만 사용합니다.
          </span>
          <Switch
            checked={formValues.isPhantom}
            onCheckedChange={(checked) =>
              onChange({ ...formValues, isPhantom: checked })
            }
          />
        </div>
      ),
    },
    {
      alignTop: true,
      label: "설명",
      value: (
        <Textarea
          id="part-editor-description"
          className={tableTextareaClassName}
          placeholder="부품의 사용 맥락, 조립 유의사항, 공급 제약을 입력하세요"
          value={formValues.description}
          onChange={(event) =>
            onChange({ ...formValues, description: event.target.value })
          }
        />
      ),
    },
    ...extendedFields.map((field) => ({
      alignTop: false,
      label: field.label,
      value: (
        <div className="space-y-2">
          <Input
            className={tableFieldClassName}
            id={`part-editor-extra-${field.id}`}
            placeholder={field.placeholder}
            value={field.value}
            onChange={(event) => {
              if (!onExtendedFieldsChange) {
                return;
              }

              onExtendedFieldsChange(
                extendedFields.map((item) =>
                  item.id === field.id
                    ? { ...item, value: event.target.value }
                    : item,
                ),
              );
            }}
          />
          {field.helperText ? (
            <p className="text-xs leading-5 text-muted-foreground">
              {field.helperText}
            </p>
          ) : null}
        </div>
      ),
    })),
  ];

  return (
    <div className="min-h-full">
      <div className="mb-4 flex items-center gap-1.5 text-sm">
        <button
          className="inline-flex cursor-pointer items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
          type="button"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </button>
        <span className="text-muted-foreground/40">/</span>
        {mode === "edit" ? (
          <>
            <span className="font-semibold text-foreground">
              {formValues.partNumber.trim() || "부품"}
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-primary">
              <PencilLine className="h-3.5 w-3.5" />
              편집 중
            </span>
          </>
        ) : (
          <span className="font-semibold text-foreground">
            {createBreadcrumbLabel}
          </span>
        )}
      </div>

      <div className="mb-5 rounded-lg border bg-card">
        <div className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono text-xl font-bold text-foreground">
                  {formValues.partNumber.trim() || "PART-NUMBER"}
                </span>
                <span className="text-muted-foreground/40">/</span>
                <span className="font-medium text-foreground">
                  REV {revisionLabel}
                </span>
                {lastSavedLabel ? (
                  <>
                    <span className="text-muted-foreground/40">/</span>
                    <span>{lastSavedLabel}</span>
                  </>
                ) : null}
              </div>
              <h1 className="mt-2 text-lg font-semibold text-foreground">
                {formValues.name.trim() || "품명이 없습니다."}
              </h1>
              {headerDescription ? (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {headerDescription}
                </p>
              ) : null}
            </div>

            <div
              className={cn(
                "flex gap-2 lg:justify-end",
                mode === "edit"
                  ? "w-full flex-col items-stretch sm:w-[90px]"
                  : "flex-wrap items-center",
              )}
            >
              {onSaveDraft && mode !== "edit" ? (
                <Button type="button" variant="outline" onClick={onSaveDraft}>
                  {secondaryLabel}
                </Button>
              ) : null}
              <Button
                className={cn(mode === "edit" && "w-full")}
                size={mode === "edit" ? "sm" : undefined}
                type="button"
                variant="outline"
                onClick={onBack}
              >
                취소
              </Button>
              <Button
                className={cn(mode === "edit" && "w-full")}
                size={mode === "edit" ? "sm" : undefined}
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setSubmitted(true);
                  if (!partNumberEmpty) {
                    onSubmit();
                  }
                }}
              >
                {isSubmitting ? "처리 중..." : primaryLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 border-b">
        <div className="flex flex-wrap">
          {(mode === "create"
            ? editorTabs.filter((tab) => tab.id === "properties")
            : editorTabs
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === "properties";

            return (
              <div
                key={tab.id}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.value != null && tab.value > 0 ? (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground">
                    {tab.value}
                  </span>
                ) : null}
                {isActive ? (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-5",
          showDrawingPreview && "lg:grid-cols-5",
        )}
      >
        {showDrawingPreview ? (
          <div className="lg:col-span-3">
            <PartDrawingPreview
              activityState="idle"
              part={{
                drawing: drawing ?? null,
                partNumber: formValues.partNumber.trim() || "PART-NUMBER",
              }}
              onOpenViewer={onOpenDrawingViewer}
            />
          </div>
        ) : null}

        <div className={cn(showDrawingPreview && "lg:col-span-2")}>
          <PartPropertiesTable rows={tableRows} />
        </div>
      </div>
    </div>
  );
}
