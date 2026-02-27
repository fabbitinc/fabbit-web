import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Upload,
  Loader2,
  FileSpreadsheet,
  Sparkles,
  SquareCheckBig,
  CheckCircle2,
  X,
  AlertTriangle,
  GripVertical,
  Lock,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useAttributes,
  useBulkSaveDefinitions,
} from "@/api/hooks/useAttributes";
import { suggestAttributes } from "@/api";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  PROPERTY_TYPES,
  DATA_TYPE_MAP,
  REVERSE_DATA_TYPE_MAP,
  CompactPropertyCard,
  ExpandedPropertyCard,
  convertSuggestedToPropertyMapping,
  convertAttributeToExistingProperty,
} from "@/features/upload/components/PropertyMappingCards";
import type {
  PropertyType,
  PropertyMapping,
  ExistingProperty,
} from "@/features/upload/components/PropertyMappingCards";
import type { AttributeDefinitionDto } from "@/api/types/import";
import type { CreateAttributeRequest, BulkDefinitionItem } from "@/api/types/attribute";

// 로컬 속성 타입
interface LocalAttribute extends AttributeDefinitionDto {
  _isNew?: boolean;
  _tempId?: string;
}

let tempIdCounter = 0;
function generateTempId(): string {
  return `_temp_${Date.now()}_${++tempIdCounter}`;
}

interface AttributeSettingsProps {
  projectId: string;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function AttributeSettings({ projectId, onDirtyChange }: AttributeSettingsProps) {
  const { data: attributes, isLoading } = useAttributes(projectId);
  const saveMutation = useBulkSaveDefinitions(projectId);

  const [localAttributes, setLocalAttributes] = useState<LocalAttribute[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<LocalAttribute | null>(null);
  const [isDetectDialogOpen, setIsDetectDialogOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // 서버 데이터가 로드되면 로컬 상태 초기화
  const prevDataRef = useRef<typeof attributes>(undefined);
  useEffect(() => {
    if (attributes && attributes !== prevDataRef.current) {
      prevDataRef.current = attributes;
      setLocalAttributes(attributes.map((attr) => ({ ...attr })));
    }
  }, [attributes]);

  const serverAttributes = attributes ?? [];

  // 변경 감지
  const { hasChanges, changeCount, modifiedIds } = useMemo(() => {
    if (serverAttributes.length === 0 && localAttributes.length === 0) {
      return { hasChanges: false, changeCount: 0, modifiedIds: new Set<string>() };
    }

    const serverMap = new Map(serverAttributes.map((a) => [a.id, a]));
    const modified = new Set<string>();

    const added = localAttributes.filter((la) => la._isNew);

    const localIds = new Set(localAttributes.filter((la) => !la._isNew).map((la) => la.id));
    const deleted = serverAttributes.filter((a) => !a.isSystem && !localIds.has(a.id));

    for (const la of localAttributes) {
      if (la._isNew) continue;
      const server = serverMap.get(la.id);
      if (!server) continue;
      if (
        la.displayName !== server.displayName ||
        la.dataType !== server.dataType ||
        la.required !== server.required ||
        JSON.stringify(la.options) !== JSON.stringify(server.options)
      ) {
        modified.add(la.id);
      }
    }

    const count = added.length + deleted.length + modified.size;

    // 순서 변경: hasChanges 트리거용 (카운트에는 미포함)
    let orderChanged = false;
    const serverIdOrder = serverAttributes.map((a) => a.id);
    const localIdOrder = localAttributes.filter((la) => !la._isNew).map((la) => la.id);
    if (
      serverIdOrder.length !== localIdOrder.length ||
      serverIdOrder.some((id, i) => id !== localIdOrder[i])
    ) {
      orderChanged = true;
    }

    return { hasChanges: count > 0 || orderChanged, changeCount: count, modifiedIds: modified };
  }, [serverAttributes, localAttributes]);

  // 변경사항 상위 전파
  useEffect(() => {
    onDirtyChange?.(hasChanges);
  }, [hasChanges, onDirtyChange]);

  // 기존 속성 이름 목록 (중복 검증용)
  const existingNames = useMemo(
    () => new Set(localAttributes.map((la) => la.name.toLowerCase())),
    [localAttributes],
  );

  // 되돌리기
  const handleReset = () => {
    setLocalAttributes(serverAttributes.map((attr) => ({ ...attr })));
    setIsResetConfirmOpen(false);
  };

  // 저장
  const handleSave = () => {
    const definitions: BulkDefinitionItem[] = localAttributes
      .filter((la) => !la.isSystem)
      .map((la) => ({
        id: la._isNew ? null : la.id,
        name: la.name,
        displayName: la.displayName,
        dataType: la.dataType,
        required: la.required,
        options: la.options,
        description: la.description,
        placeholder: la.placeholder,
        isActive: la.isActive,
      }));

    saveMutation.mutate({ definitions });
  };

  // 속성 추가 (로컬)
  const handleAddAttribute = (data: CreateAttributeRequest) => {
    const maxSortOrder = localAttributes.length > 0
      ? Math.max(...localAttributes.map((a) => a.sortOrder))
      : 0;

    const tempId = generateTempId();
    const newAttr: LocalAttribute = {
      id: tempId,
      name: data.name,
      displayName: data.displayName,
      dataType: data.dataType,
      required: data.required ?? false,
      options: data.options ?? null,
      description: null,
      placeholder: null,
      sortOrder: maxSortOrder + 1,
      isSystem: false,
      isActive: true,
      _isNew: true,
      _tempId: tempId,
    };

    setLocalAttributes((prev) => [...prev, newAttr]);
    setIsAddDialogOpen(false);
  };

  // 속성 수정 (로컬)
  const handleUpdateAttribute = (data: CreateAttributeRequest) => {
    if (!editingAttribute) return;

    setLocalAttributes((prev) =>
      prev.map((la) =>
        la.id === editingAttribute.id
          ? {
              ...la,
              displayName: data.displayName,
              dataType: data.dataType,
              required: data.required ?? false,
              options: data.options ?? null,
            }
          : la,
      ),
    );
    setEditingAttribute(null);
  };

  // 속성 삭제 (로컬)
  const handleDeleteAttribute = (id: string) => {
    setLocalAttributes((prev) => {
      const filtered = prev.filter((la) => la.id !== id);
      return filtered.map((la, index) => ({ ...la, sortOrder: index + 1 }));
    });
  };

  // 드래그앤드롭 순서 변경
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalAttributes((prev) => {
      const oldIndex = prev.findIndex((a) => a.id === active.id);
      const newIndex = prev.findIndex((a) => a.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const moved = arrayMove(prev, oldIndex, newIndex);
      return moved.map((la, i) => ({ ...la, sortOrder: i + 1 }));
    });
  };

  // BOM 감지 결과를 로컬 상태에 추가
  const handleBomDetected = (requests: CreateAttributeRequest[]) => {
    const maxSortOrder = localAttributes.length > 0
      ? Math.max(...localAttributes.map((a) => a.sortOrder))
      : 0;

    const newAttrs: LocalAttribute[] = requests.map((req, i) => {
      const tempId = generateTempId();
      return {
        id: tempId,
        name: req.name,
        displayName: req.displayName,
        dataType: req.dataType,
        required: req.required ?? false,
        options: req.options ?? null,
        description: null,
        placeholder: null,
        sortOrder: maxSortOrder + 1 + i,
        isSystem: false,
        isActive: true,
        _isNew: true,
        _tempId: tempId,
      };
    });

    setLocalAttributes((prev) => [...prev, ...newAttrs]);
    setIsDetectDialogOpen(false);
  };

  const sortableIds = localAttributes.map((a) => a.id);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-lg font-semibold text-[#0f172a]">속성 관리</h2>
        <p className="mt-1 text-sm text-[#64748b]">
          프로젝트에서 사용할 속성을 관리합니다. BOM 파일에서 속성을 자동 감지하거나 수동으로 추가할 수 있습니다.
        </p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            속성 추가
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDetectDialogOpen(true)}
            className="text-[#8b5cf6] border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/5"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            BOM 파일에서 감지
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-[#64748b]"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              되돌리기
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
            className="bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            저장{changeCount > 0 ? ` (${changeCount}개 변경)` : ""}
          </Button>
        </div>
      </div>

      {/* 속성 테이블 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
        </div>
      ) : localAttributes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#e2e8f0] py-12">
          <FileSpreadsheet className="h-12 w-12 text-[#cbd5e1]" />
          <p className="mt-3 text-sm font-medium text-[#64748b]">
            아직 속성이 없습니다
          </p>
          <p className="mt-1 text-xs text-[#94a3b8]">
            속성을 추가하거나 BOM 파일에서 자동 감지해 보세요
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            <div className="rounded-lg border border-[#e2e8f0] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="w-10 px-2 py-3" />
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b]">이름</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b]">표시 이름</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b]">타입</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#64748b]">필수</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#64748b]">시스템</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b]">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {localAttributes.map((attr) => (
                    <SortableRow
                      key={attr.id}
                      attr={attr}
                      isModified={modifiedIds.has(attr.id)}
                      onEdit={() => setEditingAttribute(attr)}
                      onDelete={() => handleDeleteAttribute(attr.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 속성 추가/수정 다이얼로그 */}
      <AttributeFormDialog
        isOpen={isAddDialogOpen || !!editingAttribute}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingAttribute(null);
        }}
        attribute={editingAttribute}
        existingNames={existingNames}
        onSubmit={(data) => {
          if (editingAttribute) {
            handleUpdateAttribute(data);
          } else {
            handleAddAttribute(data);
          }
        }}
        isSubmitting={false}
      />

      {/* BOM 파일에서 감지 다이얼로그 */}
      <DetectFromBomDialog
        isOpen={isDetectDialogOpen}
        onClose={() => setIsDetectDialogOpen(false)}
        existingAttributes={localAttributes}
        onBatchCreate={handleBomDetected}
        isSubmitting={false}
      />

      {/* 되돌리기 확인 다이얼로그 */}
      <ConfirmDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="변경사항 되돌리기"
        description={`${changeCount}개의 변경사항이 모두 취소됩니다. 되돌리시겠습니까?`}
        confirmLabel="되돌리기"
        variant="destructive"
        onConfirm={handleReset}
      />
    </div>
  );
}

// ============================================
// 드래그 가능한 테이블 행
// ============================================
interface SortableRowProps {
  attr: LocalAttribute;
  isModified: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableRow({ attr, isModified, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes: dndAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: attr.id, disabled: attr.isSystem });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeInfo = PROPERTY_TYPES.find(
    (t) => t.value === DATA_TYPE_MAP[attr.dataType],
  );
  const TypeIcon = typeInfo?.icon;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "hover:bg-[#f8fafc]",
        attr._isNew && "border-l-2 border-l-[#22c55e] bg-[#f0fdf4]",
        isModified && !attr._isNew && "border-l-2 border-l-[#f59e0b] bg-[#fffbeb]",
        isDragging && "opacity-50 bg-[#f1f5f9]",
      )}
    >
      {/* 드래그 핸들 */}
      <td className="w-10 px-2 py-3 text-center">
        {!attr.isSystem ? (
          <button
            {...dndAttributes}
            {...listeners}
            className="cursor-grab rounded p-1 text-[#94a3b8] hover:text-[#64748b] hover:bg-[#f1f5f9] active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : (
          <span className="text-xs text-[#cbd5e1]">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <code className="rounded bg-[#f1f5f9] px-2 py-0.5 text-xs font-mono text-[#0f172a]">
          {attr.name}
        </code>
      </td>
      <td className="px-4 py-3 text-[#0f172a]">{attr.displayName}</td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-[#64748b]">
          {TypeIcon && <TypeIcon className="h-3.5 w-3.5" />}
          {typeInfo?.label}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {attr.required && (
          <SquareCheckBig className="mx-auto h-4 w-4 text-[#3b82f6]" />
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {attr.isSystem && (
          <Lock className="mx-auto h-3.5 w-3.5 text-[#94a3b8]" />
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {!attr.isSystem && (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#64748b] hover:text-[#0f172a]"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#64748b] hover:text-[#ef4444]"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ============================================
// 속성 추가/수정 폼 다이얼로그
// ============================================
interface AttributeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  attribute: LocalAttribute | null;
  existingNames: Set<string>;
  onSubmit: (data: CreateAttributeRequest) => void;
  isSubmitting: boolean;
}

function AttributeFormDialog({
  isOpen,
  onClose,
  attribute,
  existingNames,
  onSubmit,
  isSubmitting,
}: AttributeFormDialogProps) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dataType, setDataType] = useState<PropertyType>("string");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    if (attribute) {
      setName(attribute.name);
      setDisplayName(attribute.displayName);
      setDataType(DATA_TYPE_MAP[attribute.dataType]);
      setRequired(attribute.required);
      setOptions(attribute.options ?? []);
    } else {
      setName("");
      setDisplayName("");
      setDataType("string");
      setRequired(false);
      setOptions([]);
    }
  }, [attribute, isOpen]);

  // 이름 중복 검증 (신규 생성 시에만)
  const isDuplicateName = !attribute && name.trim() !== "" && existingNames.has(name.trim().toLowerCase());

  const handleSubmit = () => {
    if (isDuplicateName) return;
    onSubmit({
      name: attribute ? attribute.name : name.trim(),
      displayName,
      dataType: REVERSE_DATA_TYPE_MAP[dataType],
      required,
      options: (dataType === "select" || dataType === "multiselect") ? options : undefined,
    });
  };

  const addOption = () => {
    if (newOption.trim()) {
      setOptions((prev) => [...prev, newOption.trim()]);
      setNewOption("");
    }
  };

  const isValid = displayName.trim() && (attribute || name.trim()) &&
    ((dataType !== "select" && dataType !== "multiselect") || options.length > 0) &&
    !isDuplicateName;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {attribute ? "속성 수정" : "속성 추가"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name (생성 시에만) */}
          {!attribute && (
            <div>
              <label className="text-sm font-medium text-[#0f172a]">속성 이름 (영문)</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: weight, surface_finish"
                className={cn("mt-1.5", isDuplicateName && "border-[#ef4444] focus-visible:ring-[#ef4444]")}
              />
              {isDuplicateName && (
                <p className="mt-1 text-xs text-[#ef4444]">
                  이미 사용 중인 속성 이름입니다
                </p>
              )}
            </div>
          )}

          {/* Display Name */}
          <div>
            <label className="text-sm font-medium text-[#0f172a]">표시 이름</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="예: 무게, 표면 처리"
              className="mt-1.5"
            />
          </div>

          {/* Data Type */}
          <div>
            <label className="text-sm font-medium text-[#0f172a]">데이터 타입</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = dataType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      setDataType(type.value);
                      if (type.value !== "select" && type.value !== "multiselect") {
                        setOptions([]);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-[#3b82f6] text-white"
                        : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options for select types */}
          {(dataType === "select" || dataType === "multiselect") && (
            <div>
              <label className="text-sm font-medium text-[#0f172a]">선택 옵션</label>
              <div className="mt-1.5 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {options.map((option, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] px-3 py-1 text-sm text-[#0f172a]"
                    >
                      {option}
                      <button
                        onClick={() => setOptions((prev) => prev.filter((_, i) => i !== index))}
                        className="ml-1 text-[#94a3b8] hover:text-[#ef4444]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="새 옵션 입력"
                    className="h-8 text-sm"
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addOption())
                    }
                  />
                  <Button variant="outline" size="sm" onClick={addOption} className="h-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Required */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="rounded border-[#d1d5db]"
            />
            <span className="text-sm text-[#0f172a]">필수 속성</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-[#3b82f6] hover:bg-[#2563eb]"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {attribute ? "수정" : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// BOM 파일에서 속성 감지 다이얼로그
// ============================================
interface DetectFromBomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingAttributes: LocalAttribute[];
  onBatchCreate: (requests: CreateAttributeRequest[]) => void;
  isSubmitting: boolean;
}

type DetectStep = "upload" | "analyzing" | "review";

function DetectFromBomDialog({
  isOpen,
  onClose,
  existingAttributes,
  onBatchCreate,
  isSubmitting,
}: DetectFromBomDialogProps) {
  const [step, setStep] = useState<DetectStep>("upload");
  const [newMappings, setNewMappings] = useState<PropertyMapping[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  const existingPropertyList = useMemo<ExistingProperty[]>(
    () => existingAttributes.map(convertAttributeToExistingProperty),
    [existingAttributes],
  );

  useEffect(() => {
    if (!isOpen) {
      setStep("upload");
      setNewMappings([]);
      setError(null);
    }
  }, [isOpen]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setStep("analyzing");
      setError(null);

      try {
        const result = await suggestAttributes(file);

        const mappings = result.suggestedAttributes.map((suggested, index) =>
          convertSuggestedToPropertyMapping(suggested, index),
        );

        setNewMappings(mappings);
        setStep("review");
      } catch (err) {
        setError(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다");
        setStep("upload");
      }
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
      e.target.value = "";
    },
    [handleFileUpload],
  );

  const updateMapping = (id: string, updates: Partial<PropertyMapping>) => {
    setNewMappings((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const handleConfirm = () => {
    const createRequests: CreateAttributeRequest[] = newMappings
      .filter((m) => m.action === "create" && m.isConfigured)
      .map((m) => ({
        name: m.originalColumn,
        displayName: m.displayName,
        dataType: REVERSE_DATA_TYPE_MAP[m.type],
        options: (m.type === "select" || m.type === "multiselect") ? m.options : undefined,
      }));

    if (createRequests.length > 0) {
      onBatchCreate(createRequests);
    } else {
      onClose();
    }
  };

  const unconfiguredCount = newMappings.filter((m) => !m.isConfigured).length;
  const createCount = newMappings.filter((m) => m.action === "create" && m.isConfigured).length;

  // 닫기 시도 처리
  const handleOpenChange = (open: boolean) => {
    if (open) return;
    if (step === "analyzing") return; // 분석 중 닫기 차단
    if (step === "review" && newMappings.length > 0) {
      setIsCloseConfirmOpen(true); // 리뷰 중 확인 요청
      return;
    }
    onClose();
  };

  const handleForceClose = () => {
    setIsCloseConfirmOpen(false);
    onClose();
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-3xl w-[80vw] max-h-[80vh] overflow-hidden flex flex-col"
        showCloseButton={step !== "analyzing"}
        onPointerDownOutside={(e) => { if (step === "analyzing") e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (step === "analyzing") e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#8b5cf6]" />
            BOM 파일에서 속성 감지
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#dc2626]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div
              className="relative rounded-xl border-2 border-dashed border-[#e2e8f0] bg-[#f8fafc] p-12 text-center transition-colors hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8b5cf6]/10">
                  <Upload className="h-7 w-7 text-[#8b5cf6]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">
                    BOM 파일을 드래그하거나 클릭하여 선택
                  </p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    Excel, CSV 파일 지원 (.xlsx, .xls, .csv)
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#94a3b8]">
              파일을 분석하여 새로운 속성을 자동으로 감지합니다. 기존에 등록된 속성은 건너뜁니다.
            </p>
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#8b5cf6]" />
            <p className="mt-4 text-sm font-medium text-[#0f172a]">파일 분석 중...</p>
            <p className="mt-1 text-xs text-[#64748b]">
              AI가 속성을 감지하고 있습니다
            </p>
          </div>
        )}

        {step === "review" && (
          <>
            <div className="flex-1 overflow-auto space-y-3 pr-2">
              {newMappings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-[#22c55e]" />
                  <p className="mt-3 text-sm font-medium text-[#0f172a]">
                    새로운 속성이 감지되지 않았습니다
                  </p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    모든 컬럼이 기존 속성과 매칭됩니다
                  </p>
                </div>
              ) : (
                newMappings.map((mapping) =>
                  mapping.isConfigured ? (
                    <CompactPropertyCard
                      key={mapping.id}
                      mapping={mapping}
                      existingProperties={existingPropertyList}
                      onEdit={() => updateMapping(mapping.id, { isConfigured: false })}
                    />
                  ) : (
                    <ExpandedPropertyCard
                      key={mapping.id}
                      mapping={mapping}
                      existingProperties={existingPropertyList}
                      onUpdate={(updates) => updateMapping(mapping.id, updates)}
                      onConfirm={() => updateMapping(mapping.id, { isConfigured: true })}
                    />
                  ),
                )
              )}
            </div>

            <div className="flex justify-between items-center border-t border-[#f1f5f9] pt-4">
              <div className="text-sm text-[#64748b]">
                {unconfiguredCount > 0 ? (
                  <span className="text-[#f59e0b]">
                    {unconfiguredCount}개 속성 설정이 필요합니다
                  </span>
                ) : createCount > 0 ? (
                  <span className="text-[#22c55e]">
                    {createCount}개 속성이 추가됩니다
                  </span>
                ) : (
                  <span className="text-[#64748b]">추가할 속성이 없습니다</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  취소
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={unconfiguredCount > 0 || isSubmitting}
                  className="bg-[#3b82f6] hover:bg-[#2563eb]"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {createCount > 0 ? `${createCount}개 속성 추가` : "완료"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>

    <ConfirmDialog
      open={isCloseConfirmOpen}
      onOpenChange={setIsCloseConfirmOpen}
      title="감지 결과 닫기"
      description="감지된 속성 정보가 사라집니다. 닫으시겠습니까?"
      confirmLabel="닫기"
      variant="destructive"
      onConfirm={handleForceClose}
    />
    </>
  );
}
