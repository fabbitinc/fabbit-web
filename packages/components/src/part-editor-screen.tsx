import {
  ArrowLeft,
  Building2,
  Check,
  ChevronsUpDown,
  Clock,
  FolderKanban,
  Loader2,
  Network,
  Package,
  PencilLine,
  Paperclip,
  Plus,
} from "lucide-react";
import { type ComponentType, useEffect, useRef, useState } from "react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
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

export type PartEditorScreenSystemFieldKey =
  | "partNumber"
  | "name"
  | "revision"
  | "lifecycleState"
  | "category"
  | "material"
  | "unit"
  | "leadTimeDays"
  | "isPhantom"
  | "description";

export interface PartEditorScreenSystemField {
  active?: boolean;
  displayOrder?: number;
  key: PartEditorScreenSystemFieldKey;
  label: string;
}

export interface PartEditorScreenExtendedField {
  helperText?: string;
  id: string;
  label: string;
  optionMode?: "FIXED" | "CREATABLE" | null;
  options?: PartEditorScreenOption[];
  placeholder?: string;
  required?: boolean;
  value: string | boolean;
  valueType?: "STRING" | "INTEGER" | "FLOAT" | "BOOLEAN" | "OPTION";
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

export interface PartEditorScreenNumberingCategory {
  id: string;
  name: string;
  prefix: string;
  delimiter: string;
  digits: number;
  previewPartNumber: string;
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
  // 채번 카테고리 props
  numberingCategories?: PartEditorScreenNumberingCategory[];
  numberingCategoriesLoading?: boolean;
  selectedNumberingCategoryId?: string;
  nextPartNumber?: string | null;
  nextPartNumberLoading?: boolean;
  nextPartNumberNote?: string | null;
  partNumberAvailability?: "available" | "taken" | "checking" | null;
  isAdmin?: boolean;
  onNumberingCategoryChange?: (categoryId: string) => void;
  onPartNumberBlur?: (value: string) => void;
  onNumberingModeChange?: (mode: "manual" | "auto") => void;
  onInlineCreateCategory?: () => void;
  onBack: () => void;
  onChange: (values: PartEditorScreenFormValues) => void;
  onExtendedFieldsChange?: (fields: PartEditorScreenExtendedField[]) => void;
  onSaveDraft?: () => void;
  onSubmit: () => void;
  onOpenDrawingViewer?: (drawing: PartDrawingPreviewDrawing) => void;
  referenceStats?: PartEditorScreenReferenceStats;
  saveDraftLabel?: string;
  submitLabel?: string;
  systemFields?: PartEditorScreenSystemField[];
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

interface CreatableOptionComboboxProps {
  className?: string;
  creatable?: boolean;
  options: PartEditorScreenOption[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function CreatableOptionCombobox({
  className,
  creatable = true,
  options,
  placeholder,
  value,
  onChange,
}: CreatableOptionComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const displayValue = value.trim();
  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  );
  const hasExactMatch = options.some(
    (option) =>
      option.value.toLowerCase() === search.trim().toLowerCase() ||
      option.label.toLowerCase() === search.trim().toLowerCase(),
  );

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
          <span className="truncate">{displayValue || placeholder}</span>
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
            {creatable && search.trim() && !hasExactMatch ? (
              <CommandGroup heading="직접 입력">
                <CommandItem
                  value={`__custom__${search}`}
                  onSelect={() => {
                    onChange(search.trim());
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span>&ldquo;{search.trim()}&rdquo; 사용</span>
                </CommandItem>
              </CommandGroup>
            ) : null}
            {filtered.length > 0 ? (
              <CommandGroup heading="옵션">
                {filtered.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onChange(option.value);
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
            ) : (
              <CommandEmpty>선택 가능한 옵션이 없습니다.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// 채번 카테고리 선택 (Popover/Command 패턴, 관리자용 인라인 생성 링크 포함)
interface NumberingCategorySelectProps {
  categories: PartEditorScreenNumberingCategory[];
  loading?: boolean;
  selectedId?: string;
  isAdmin?: boolean;
  onSelect: (id: string) => void;
  onInlineCreate: () => void;
}

function NumberingCategorySelect({
  categories,
  loading = false,
  selectedId,
  isAdmin = false,
  onSelect,
  onInlineCreate,
}: NumberingCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === selectedId);

  if (loading) {
    return (
      <div className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-sm">
        <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">로딩 중...</span>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex h-8 items-center rounded-md border border-input bg-background px-2.5 text-sm text-muted-foreground">
        채번 규칙 없음
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="채번 카테고리"
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 text-sm shadow-xs",
            !selected && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {selected ? `${selected.name} (${selected.previewPartNumber})` : "카테고리를 선택하세요"}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandList>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={() => {
                    onSelect(category.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5",
                      selectedId === category.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate">{category.name}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {category.previewPartNumber}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            {isAdmin ? (
              <>
                <div className="border-t border-border/70" />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onInlineCreate();
                    }}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    새 채번 규칙 만들기
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const DEFAULT_SYSTEM_FIELDS: PartEditorScreenSystemField[] = [
  { key: "partNumber", label: "품번", displayOrder: 10 },
  { key: "name", label: "품명", displayOrder: 20 },
  { key: "revision", label: "리비전", displayOrder: 30 },
  { key: "lifecycleState", label: "상태", displayOrder: 40 },
  { key: "category", label: "카테고리", displayOrder: 50 },
  { key: "material", label: "재질", displayOrder: 60 },
  { key: "unit", label: "단위", displayOrder: 70 },
  { key: "leadTimeDays", label: "리드타임", displayOrder: 80 },
  { key: "isPhantom", label: "팬텀", displayOrder: 90 },
  { key: "description", label: "설명", displayOrder: 100 },
];

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
  // 채번 카테고리 props
  numberingCategories,
  numberingCategoriesLoading = false,
  selectedNumberingCategoryId,
  nextPartNumber,
  nextPartNumberLoading = false,
  nextPartNumberNote,
  partNumberAvailability,
  isAdmin = false,
  onNumberingCategoryChange,
  onPartNumberBlur,
  onNumberingModeChange,
  onInlineCreateCategory,
  onBack,
  onChange,
  onExtendedFieldsChange,
  onOpenDrawingViewer,
  onSaveDraft,
  onSubmit,
  saveDraftLabel,
  submitLabel,
  systemFields,
  unitOptions,
}: PartEditorScreenProps) {
  const createBreadcrumbLabel = heading ?? "새 부품";
  const primaryLabel =
    submitLabel ?? (mode === "create" ? "부품 생성" : "변경 저장");
  const secondaryLabel =
    saveDraftLabel ?? (mode === "create" ? "초안 저장" : "임시 저장");
  const [submitted, setSubmitted] = useState(false);

  // 채번 모드 상태
  const hasNumberingCategories = (numberingCategories ?? []).length > 0;
  const [numberingMode, setNumberingMode] = useState<"manual" | "auto">(
    hasNumberingCategories ? "auto" : "manual",
  );
  const initialModeSet = useRef(false);
  // 카테고리 로드 완료 시 기본 모드를 한 번만 설정 (사용자가 이미 타이핑을 시작했으면 수동 유지)
  useEffect(() => {
    if (initialModeSet.current) return;
    if (numberingCategoriesLoading) return;
    initialModeSet.current = true;
    if (hasNumberingCategories && formValues.partNumber.trim() === "") {
      setNumberingMode("auto");
      onNumberingModeChange?.("auto");
    } else {
      setNumberingMode("manual");
      onNumberingModeChange?.("manual");
    }
  }, [hasNumberingCategories, numberingCategoriesLoading, formValues.partNumber, onNumberingModeChange]);

  // 수동 입력값 보존용 내부 상태
  const [savedManualPartNumber, setSavedManualPartNumber] = useState(formValues.partNumber);

  const isAutoMode = numberingMode === "auto";
  const partNumberEmpty = !isAutoMode && formValues.partNumber.trim() === "";
  const autoModeNoCategorySelected = isAutoMode && !selectedNumberingCategoryId;
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
  const systemFieldMap = new Map(
    (systemFields ?? DEFAULT_SYSTEM_FIELDS).map((field) => [field.key, field]),
  );
  const resolvedSystemFields = DEFAULT_SYSTEM_FIELDS.map((defaultField) => {
    const override = systemFieldMap.get(defaultField.key);

    return {
      ...defaultField,
      ...override,
      label: override?.label ?? defaultField.label,
      active: override?.active ?? true,
      displayOrder: override?.displayOrder ?? defaultField.displayOrder ?? 0,
    };
  })
    .filter((field) => field.active !== false)
    .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0));

  function updateExtendedField(fieldId: string, nextValue: string | boolean) {
    if (!onExtendedFieldsChange) {
      return;
    }

    onExtendedFieldsChange(
      extendedFields.map((field) =>
        field.id === fieldId ? { ...field, value: nextValue } : field,
      ),
    );
  }

  const tableRows = [
    {
      key: "partNumber" as const,
      error: submitted && partNumberEmpty
        ? "품번을 입력해 주세요."
        : submitted && autoModeNoCategorySelected
          ? "채번 카테고리를 선택해 주세요."
          : undefined,
      value: lockedFields?.partNumber ? (
        <span className="font-mono text-xs">{formValues.partNumber}</span>
      ) : (
        <div className="space-y-2">
          {/* 채번 카테고리가 있을 때만 RadioGroup 표시 */}
          {hasNumberingCategories && mode === "create" ? (
            <RadioGroup
              aria-label="품번 입력 방식"
              className="flex items-center gap-4"
              value={numberingMode}
              onValueChange={(value: string) => {
                const nextMode = value as "manual" | "auto";
                if (nextMode === "manual" && isAutoMode) {
                  // 자동 -> 수동 전환: 보존된 값 복원
                  onChange({ ...formValues, partNumber: savedManualPartNumber });
                }
                if (nextMode === "auto" && !isAutoMode) {
                  // 수동 -> 자동 전환: 현재 값 보존
                  setSavedManualPartNumber(formValues.partNumber);
                }
                setNumberingMode(nextMode);
                onNumberingModeChange?.(nextMode);
              }}
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="manual" id="pn-mode-manual" />
                <Label htmlFor="pn-mode-manual" className="cursor-pointer text-sm font-normal">수동 입력</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="auto" id="pn-mode-auto" />
                <Label htmlFor="pn-mode-auto" className="cursor-pointer text-sm font-normal">자동 채번</Label>
              </div>
            </RadioGroup>
          ) : null}

          {/* 수동 입력 모드 */}
          {!isAutoMode ? (
            <div className="space-y-1">
              <Input
                className={tableFieldClassName}
                id="part-editor-part-number"
                placeholder="예: DRV-BASE-0142"
                value={formValues.partNumber}
                onChange={(event) =>
                  onChange({ ...formValues, partNumber: event.target.value })
                }
                onBlur={() => onPartNumberBlur?.(formValues.partNumber)}
              />
              {/* 품번 중복 확인 결과 */}
              {partNumberAvailability ? (
                <div aria-live="polite" className="flex items-center gap-1.5 text-xs">
                  {partNumberAvailability === "checking" ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" />
                      확인 중...
                    </span>
                  ) : partNumberAvailability === "available" ? (
                    <span className="text-emerald-600">&#10003; 사용 가능</span>
                  ) : partNumberAvailability === "taken" ? (
                    <span className="text-amber-600">&#9888; 이미 사용 중</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* 자동 채번 모드 */}
          {isAutoMode ? (
            <div className="space-y-2">
              <NumberingCategorySelect
                categories={numberingCategories ?? []}
                loading={numberingCategoriesLoading}
                selectedId={selectedNumberingCategoryId}
                isAdmin={isAdmin}
                onSelect={(id) => onNumberingCategoryChange?.(id)}
                onInlineCreate={() => onInlineCreateCategory?.()}
              />
              {/* 다음 품번 미리보기 */}
              {selectedNumberingCategoryId ? (
                <div aria-live="polite" className="rounded-md border border-border/70 bg-muted/30 px-3 py-2">
                  {nextPartNumberLoading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  ) : nextPartNumber ? (
                    <div>
                      <p className="text-xs text-muted-foreground">예상 번호</p>
                      <p className="font-mono text-sm font-medium text-foreground">{nextPartNumber}</p>
                      {nextPartNumberNote ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">{nextPartNumberNote}</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs text-destructive">품번을 불러올 수 없습니다</p>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "name" as const,
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
      key: "revision" as const,
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
      key: "lifecycleState" as const,
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
      key: "category" as const,
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
      key: "material" as const,
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
      key: "unit" as const,
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
      key: "leadTimeDays" as const,
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
      key: "isPhantom" as const,
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
      key: "description" as const,
      alignTop: true,
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
  ];
  const systemTableRows = resolvedSystemFields
    .map((field) => {
      const row = tableRows.find((candidate) => candidate.key === field.key);

      if (!row) {
        return null;
      }

      return {
        ...row,
        label: field.label,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
  const extendedTableRows = extendedFields.map((field) => ({
    alignTop: field.valueType !== "BOOLEAN",
    label: field.label,
    required: field.required,
    value: (
      <div className="space-y-2">
        {field.valueType === "BOOLEAN" ? (
          <div className="flex min-h-8 items-center justify-between gap-3">
            <span className="text-sm text-foreground">
              {field.required ? "필수 여부를 확인하세요." : "켜짐/꺼짐으로 값을 저장합니다."}
            </span>
            <Switch
              checked={field.value === true}
              onCheckedChange={(checked) => updateExtendedField(field.id, checked)}
            />
          </div>
        ) : field.valueType === "OPTION" && field.optionMode === "FIXED" ? (
          <Select
            value={typeof field.value === "string" && field.value ? field.value : "__empty__"}
            onValueChange={(nextValue) =>
              updateExtendedField(field.id, nextValue === "__empty__" ? "" : nextValue)
            }
          >
            <SelectTrigger className={tableSelectTriggerClassName}>
              <SelectValue placeholder={field.placeholder || "옵션을 선택하세요"} />
            </SelectTrigger>
            <SelectContent>
              {!field.required ? <SelectItem value="__empty__">값 비움</SelectItem> : null}
              {(field.options ?? []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.valueType === "OPTION" && field.optionMode === "CREATABLE" ? (
          <CreatableOptionCombobox
            className={tableFieldClassName}
            options={field.options ?? []}
            placeholder={field.placeholder || "옵션을 선택하거나 입력하세요"}
            value={typeof field.value === "string" ? field.value : ""}
            onChange={(nextValue) => updateExtendedField(field.id, nextValue)}
          />
        ) : (
          <Input
            className={tableFieldClassName}
            id={`part-editor-extra-${field.id}`}
            inputMode={
              field.valueType === "INTEGER"
                ? "numeric"
                : field.valueType === "FLOAT"
                  ? "decimal"
                  : undefined
            }
            placeholder={field.placeholder}
            value={typeof field.value === "string" ? field.value : ""}
            onChange={(event) => updateExtendedField(field.id, event.target.value)}
          />
        )}
        {field.helperText ? (
          <p className="text-xs leading-5 text-muted-foreground">
            {field.helperText}
          </p>
        ) : null}
      </div>
    ),
  }));

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
                  {isAutoMode && nextPartNumber
                    ? nextPartNumber
                    : formValues.partNumber.trim() || "PART-NUMBER"}
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
                disabled={isSubmitting || (isAutoMode && nextPartNumberLoading)}
                onClick={() => {
                  setSubmitted(true);
                  // 자동 채번 모드에서는 카테고리 선택 여부만 검증
                  if (isAutoMode) {
                    if (selectedNumberingCategoryId) {
                      onSubmit();
                    }
                  } else if (!partNumberEmpty) {
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
          <div className="space-y-4">
            <PartPropertiesTable rows={systemTableRows} />
            {extendedTableRows.length > 0 ? (
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">사용자 정의 항목</h3>
                  <p className="text-xs text-muted-foreground">조직에서 추가로 정의한 부품 항목입니다.</p>
                </div>
                <PartPropertiesTable rows={extendedTableRows} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
