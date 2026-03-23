import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { SortableList, type SortableListColumn } from "@fabbit/components";
import { Badge, Button, ConfirmDialog, Tooltip, TooltipContent, TooltipTrigger } from "@fabbit/ui";
import {
  useCreatePropertyDefinitionAction,
  useDeletePropertyDefinitionAction,
  usePropertyMetaQuery,
  useReorderPropertiesAction,
  useUpdatePropertyDefinitionAction,
  type PropertyMetaModel,
} from "@/features/properties";
import {
  CustomPropertyDialog,
  createInitialCustomPropertyDraft,
  formatOptionMode,
  formatValueType,
  toCustomPropertyDraft,
  toOptionalDisplayOrder,
  toOptionalString,
  toPropertyOptionRequests,
  toRequiredString,
  type CustomPropertyDraft,
} from "./custom-property-dialog";
import {
  SystemOverrideDialog,
  type SystemOverrideDraft,
} from "./system-override-dialog";

const PROPERTY_OWNER_TYPE = "PART";
const GRID_COLUMNS = "40px 1fr 120px 100px 120px 64px 100px 130px";

function toCustomPropertyDraftFromModel(property: PropertyMetaModel): CustomPropertyDraft {
  return toCustomPropertyDraft(property);
}

function toSystemOverrideDraft(property: PropertyMetaModel): SystemOverrideDraft {
  return {
    active: property.active,
    activeConfigurable: property.activeConfigurable,
    displayNameOverride: property.displayName,
    displayOrder: String(property.displayOrder ?? 0),
  };
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

/* ─── 컬럼 정의 ─── */

const columns: SortableListColumn<PropertyMetaModel>[] = [
  {
    key: "name",
    header: "항목",
    render: (item) => (
      <div className="space-y-0.5">
        <p className="font-medium text-foreground">{item.displayName}</p>
        {item.description ? (
          <p className="text-xs text-muted-foreground">{item.description}</p>
        ) : null}
      </div>
    ),
  },
  {
    key: "category",
    header: "구분",
    className: "whitespace-nowrap",
    render: (item) => (
      <Badge variant={item.system ? "secondary" : "outline"}>
        {item.system ? "기본 항목" : "사용자 정의"}
      </Badge>
    ),
  },
  {
    key: "valueType",
    header: "입력 형식",
    className: "whitespace-nowrap",
    render: (item) => formatValueType(item.valueType),
  },
  {
    key: "optionMode",
    header: "입력 방식",
    className: "whitespace-nowrap",
    render: (item) => (item.valueType === "OPTION" ? formatOptionMode(item.optionMode) : "—"),
  },
  {
    key: "required",
    header: "필수",
    className: "whitespace-nowrap",
    render: (item) => (item.required ? "필수" : "선택"),
  },
  {
    key: "active",
    header: "사용 여부",
    className: "whitespace-nowrap",
    render: (item) => (
      <Badge variant={item.active ? "success" : "outline"}>
        {item.active ? "사용 중" : "사용 안 함"}
      </Badge>
    ),
  },
];

/* ─── 메인 컴포넌트 ─── */

export function OrganizationPartsPropertiesTab() {
  const propertyMetaQuery = usePropertyMetaQuery(PROPERTY_OWNER_TYPE, true);
  const createPropertyDefinitionAction = useCreatePropertyDefinitionAction();
  const updatePropertyDefinitionAction = useUpdatePropertyDefinitionAction();
  const deletePropertyDefinitionAction = useDeletePropertyDefinitionAction({ ownerType: PROPERTY_OWNER_TYPE });
  const reorderPropertiesAction = useReorderPropertiesAction();

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
  const [deleteTarget, setDeleteTarget] = useState<PropertyMetaModel | null>(null);

  /* ── Optimistic 로컬 상태 ── */
  const [localItems, setLocalItems] = useState<PropertyMetaModel[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const serverItems = useMemo(
    () => [...(propertyMetaQuery.data ?? [])].sort(sortProperties),
    [propertyMetaQuery.data],
  );

  // mutation이 모두 끝났을 때만 서버 데이터로 동기화
  // action hook의 onSuccess가 이미 invalidate → refetch를 해주므로 추가 호출 불필요
  useEffect(() => {
    if (pendingCount === 0) {
      setLocalItems(serverItems);
    }
  }, [serverItems, pendingCount]);

  const beginMutation = useCallback(() => {
    setPendingCount((c) => c + 1);
  }, []);

  const endMutation = useCallback(() => {
    setPendingCount((c) => c - 1);
  }, []);

  /* ── 순서 변경 ── */

  const handleReorder = useCallback(
    (reordered: PropertyMetaModel[]) => {
      beginMutation();
      setLocalItems(reordered);

      reorderPropertiesAction.mutate(
        {
          owner_type: PROPERTY_OWNER_TYPE,
          properties: reordered.map((p) => ({
            property_key: p.system ? p.propertyKey : (p.definitionId ?? p.propertyKey),
            system: p.system,
          })),
        },
        { onSettled: endMutation },
      );
    },
    [reorderPropertiesAction, beginMutation, endMutation],
  );

  /* ── 활성화/비활성화 ── */

  function handleToggleActive(property: PropertyMetaModel) {
    const nextActive = !property.active;

    beginMutation();
    setLocalItems((prev) =>
      prev.map((p) => (p.propertyKey === property.propertyKey ? { ...p, active: nextActive } : p)),
    );

    updatePropertyDefinitionAction.mutate(
      {
        ownerType: PROPERTY_OWNER_TYPE,
        propertyKey: property.propertyKey,
        request: { active: nextActive, active_set: true },
      },
      { onSettled: endMutation },
    );
  }

  /* ── 편집 ── */

  function handleEdit(property: PropertyMetaModel) {
    if (property.system) {
      setEditingSystemProperty(property);
      setEditingSystemDraft(toSystemOverrideDraft(property));
    } else {
      setEditingCustomProperty(property);
      setEditingCustomDraft(toCustomPropertyDraftFromModel(property));
    }
  }

  /* ── 삭제 ── */

  function handleDeleteConfirm() {
    if (!deleteTarget) return;

    deletePropertyDefinitionAction.mutate(
      { ownerType: PROPERTY_OWNER_TYPE, propertyKey: deleteTarget.propertyKey },
      { onSuccess: () => setDeleteTarget(null) },
    );
  }

  /* ── 생성 ── */

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

  /* ── 커스텀 속성 수정 ── */

  function handleCustomUpdateSubmit() {
    if (!editingCustomProperty) return;

    updatePropertyDefinitionAction.mutate(
      {
        ownerType: PROPERTY_OWNER_TYPE,
        propertyKey: editingCustomProperty.propertyKey,
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
      { onSuccess: () => setEditingCustomProperty(null) },
    );
  }

  /* ── 시스템 속성 오버라이드 ── */

  function handleSystemOverrideSubmit() {
    if (!editingSystemProperty) return;

    updatePropertyDefinitionAction.mutate(
      {
        ownerType: PROPERTY_OWNER_TYPE,
        propertyKey: editingSystemProperty.propertyKey,
        request: {
          display_name: editingSystemDraft.displayNameOverride.trim(),
          display_name_set: true,
          display_order: toOptionalDisplayOrder(editingSystemDraft.displayOrder),
          display_order_set: true,
          active: editingSystemDraft.activeConfigurable ? editingSystemDraft.active : undefined,
          active_set: editingSystemDraft.activeConfigurable,
        },
      },
      { onSuccess: () => setEditingSystemProperty(null) },
    );
  }

  /* ── 액션 버튼 렌더링 ── */

  const renderActions = useCallback(
    (property: PropertyMetaModel) => {
      const canDelete = !property.system;
      const canToggleActive = property.system ? property.activeConfigurable : true;

      return (
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="편집" onClick={() => handleEdit(property)}>
                <Pencil className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}>편집</TooltipContent>
          </Tooltip>
          {canToggleActive ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={property.active ? "비활성화" : "활성화"}
                  onClick={() => handleToggleActive(property)}
                >
                  {property.active ? (
                    <PowerOff className="size-3.5 text-muted-foreground" />
                  ) : (
                    <Power className="size-3.5 text-primary" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>
                {property.active ? "비활성화" : "활성화"}
              </TooltipContent>
            </Tooltip>
          ) : null}
          {canDelete ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="삭제" onClick={() => setDeleteTarget(property)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>삭제</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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

      <SortableList
        columns={columns}
        emptyMessage={propertyMetaQuery.isLoading ? "항목 정보를 불러오는 중입니다." : "등록된 항목이 없습니다."}
        getItemId={(p) => p.propertyKey}
        gridTemplateColumns={GRID_COLUMNS}
        items={localItems}
        renderActions={renderActions}
        onReorder={handleReorder}
      />

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
        isPending={updatePropertyDefinitionAction.isPending}
        open={editingSystemProperty !== null}
        onClose={() => setEditingSystemProperty(null)}
        onDraftChange={setEditingSystemDraft}
        onSubmit={handleSystemOverrideSubmit}
      />

      <ConfirmDialog
        cancelLabel="취소"
        confirmLabel={deletePropertyDefinitionAction.isPending ? "삭제 중..." : "삭제"}
        description={`"${deleteTarget?.displayName}" 항목을 삭제합니다. 이 작업은 되돌릴 수 없습니다.`}
        open={deleteTarget !== null}
        title="항목을 삭제할까요?"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      />
    </div>
  );
}
