import { useState, useRef, useCallback } from "react";
import { FileText, GitBranch, Loader2, RefreshCw, Settings } from "lucide-react";
import { Badge, Button, Checkbox, Input, Popover, PopoverContent, PopoverTrigger } from "@fabbit/ui";

export type AffectedItemType = "REVISION_RELEASE" | "LIFECYCLE_CHANGE" | "WHERE_USED_IMPACT";

export interface AffectedItemSearchItem {
  /** target_id로 사용될 ID (리비전이면 revisionId, 부품이면 partId) */
  id: string;
  partNumber: string;
  name: string | null;
  /** 리비전 코드 (리비전 검색 시) */
  revisionCode?: string | null;
}

export interface AffectedItemDisplayItem {
  id: string;
  itemType: AffectedItemType;
  targetId: string;
  partId: string | null;
  partNumber: string | null;
  revisionCode: string | null;
  name: string | null;
}

export interface AffectedItemPickerSectionProps {
  /** 검색된 항목 목록 (유형에 따라 리비전 또는 부품) */
  searchedItems: AffectedItemSearchItem[];
  /** 현재 선택된 영향 항목 표시용 */
  displayItems: AffectedItemDisplayItem[];
  /** 없으면 편집 UI 숨김 (읽기 전용) */
  onSync?: (items: { targetId: string; itemType: AffectedItemType }[]) => void;
  /** 유형 변경 시 호출 (컨테이너가 검색 소스를 전환) */
  onItemTypeChange?: (itemType: "REVISION_RELEASE" | "LIFECYCLE_CHANGE") => void;
  /** 항목 클릭 시 부품 상세로 이동 */
  onNavigateToItem?: (item: { partId: string; revisionId: string }) => void;
  onRequest?: () => void;
  onSearchChange?: (search: string) => void;
  isSearching?: boolean;
  isUpdating?: boolean;
}

function itemTypeLabel(itemType: AffectedItemType): string {
  switch (itemType) {
    case "LIFECYCLE_CHANGE":
      return "Lifecycle 변경";
    default:
      return "리비전 릴리즈";
  }
}

function ItemTypeIcon({ itemType }: { itemType: AffectedItemType }) {
  if (itemType === "LIFECYCLE_CHANGE") {
    return <RefreshCw className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
  }

  if (itemType === "WHERE_USED_IMPACT") {
    return <GitBranch className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
  }

  return <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
}

export function AffectedItemPickerSection({
  searchedItems,
  displayItems,
  onSync,
  onItemTypeChange,
  onNavigateToItem,
  onRequest,
  onSearchChange,
  isSearching,
  isUpdating,
}: AffectedItemPickerSectionProps) {
  const changeTargets = displayItems.filter(
    (item) => item.itemType === "REVISION_RELEASE" || item.itemType === "LIFECYCLE_CHANGE",
  );
  const whereUsedImpacts = displayItems.filter(
    (item) => item.itemType === "WHERE_USED_IMPACT",
  );

  return (
    <div className="space-y-5">
      {/* ── 변경 대상 부품 ── */}
      <ChangeTargetSection
        items={changeTargets}
        searchedItems={searchedItems}
        onSync={onSync}
        onItemTypeChange={onItemTypeChange}
        onNavigateToItem={onNavigateToItem}
        onRequest={onRequest}
        onSearchChange={onSearchChange}
        isSearching={isSearching}
        isUpdating={isUpdating}
      />

      {/* ── 영향 받는 상위 부품 ── */}
      <WhereUsedImpactSection
        items={whereUsedImpacts}
        onNavigateToItem={onNavigateToItem}
      />
    </div>
  );
}

/* ── 변경 대상 부품 섹션 ── */

interface ChangeTargetSectionProps {
  items: AffectedItemDisplayItem[];
  searchedItems: AffectedItemSearchItem[];
  onSync?: AffectedItemPickerSectionProps["onSync"];
  onItemTypeChange?: AffectedItemPickerSectionProps["onItemTypeChange"];
  onNavigateToItem?: AffectedItemPickerSectionProps["onNavigateToItem"];
  onRequest?: () => void;
  onSearchChange?: (search: string) => void;
  isSearching?: boolean;
  isUpdating?: boolean;
}

function ChangeTargetSection({
  items,
  searchedItems,
  onSync,
  onItemTypeChange,
  onNavigateToItem,
  onRequest,
  onSearchChange,
  isSearching,
  isUpdating,
}: ChangeTargetSectionProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftItemType, setDraftItemType] = useState<"REVISION_RELEASE" | "LIFECYCLE_CHANGE">("REVISION_RELEASE");
  /** draft: targetId → itemType */
  const [draftItems, setDraftItems] = useState<Map<string, AffectedItemType>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange?.(value);
      }, 300);
    },
    [onSearchChange],
  );

  const handleApply = () => {
    if (!onSync) return;
    const result = Array.from(draftItems.entries()).map(([targetId, itemType]) => ({
      targetId,
      itemType,
    }));
    onSync(result);
    setPopoverOpen(false);
    setQuery("");
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">
          변경 대상 부품
          {items.length > 0 ? (
            <span className="ml-1 text-muted-foreground/50">({items.length})</span>
          ) : null}
        </h3>
        {onSync ? (
          <Popover
            open={popoverOpen}
            onOpenChange={(open) => {
              setPopoverOpen(open);
              if (open) {
                onRequest?.();
                setDraftItemType("REVISION_RELEASE");
                onItemTypeChange?.("REVISION_RELEASE");
                setQuery("");
                onSearchChange?.("");
                // 기존 항목을 draft에 복원
                const initial = new Map<string, AffectedItemType>();
                for (const item of items) {
                  initial.set(item.targetId, item.itemType);
                }
                setDraftItems(initial);
              } else {
                setQuery("");
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings className="h-3 w-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="end">
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">변경 대상 부품</p>

                {/* 유형 선택 */}
                <div className="flex gap-1.5">
                  <Button
                    variant={draftItemType === "REVISION_RELEASE" ? "default" : "outline"}
                    size="xs"
                    onClick={() => {
                      setDraftItemType("REVISION_RELEASE");
                      onItemTypeChange?.("REVISION_RELEASE");
                      setQuery("");
                      onSearchChange?.("");
                    }}
                  >
                    <FileText className="h-3 w-3" />
                    리비전 릴리즈
                  </Button>
                  <Button
                    variant={draftItemType === "LIFECYCLE_CHANGE" ? "default" : "outline"}
                    size="xs"
                    onClick={() => {
                      setDraftItemType("LIFECYCLE_CHANGE");
                      onItemTypeChange?.("LIFECYCLE_CHANGE");
                      setQuery("");
                      onSearchChange?.("");
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Lifecycle 변경
                  </Button>
                </div>

                <div className="relative">
                  <Input
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="품번 또는 이름으로 검색"
                  />
                  {isSearching ? (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    </div>
                  ) : null}
                </div>
                <div className="max-h-48 space-y-1 overflow-auto">
                  {searchedItems.length === 0 ? (
                    <p className="px-1 py-2 text-xs text-muted-foreground">
                      {query.trim() ? "검색 결과가 없습니다." : "품번 또는 이름을 입력하여 검색하세요."}
                    </p>
                  ) : (
                    searchedItems.map((item) => (
                      <label
                        key={item.id}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                      >
                        <Checkbox
                          checked={draftItems.has(item.id)}
                          onCheckedChange={(checked) => {
                            setDraftItems((prev) => {
                              const next = new Map(prev);
                              if (checked) {
                                next.set(item.id, draftItemType);
                              } else {
                                next.delete(item.id);
                              }
                              return next;
                            });
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">
                            {item.partNumber}
                            {item.revisionCode ? ` (Rev ${item.revisionCode})` : ""}
                          </p>
                          {item.name ? (
                            <p className="truncate text-[11px] text-muted-foreground">{item.name}</p>
                          ) : null}
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  disabled={isUpdating}
                  onClick={handleApply}
                >
                  적용
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="mt-2 space-y-1">
          {items.map((item) => {
            const canNavigate = onNavigateToItem && item.partId && item.targetId;
            return (
              <div
                key={item.id}
                className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
              >
                <ItemTypeIcon itemType={item.itemType} />
                {canNavigate ? (
                  <button
                    type="button"
                    className="min-w-0 flex-1 cursor-pointer text-left"
                    onClick={() => {
                      const partId = item.itemType === "REVISION_RELEASE" ? (item.partId ?? item.targetId) : item.targetId;
                      const revisionId = item.itemType === "REVISION_RELEASE" ? item.targetId : item.targetId;
                      onNavigateToItem!({ partId, revisionId });
                    }}
                  >
                    <p className="truncate text-xs font-medium text-foreground">
                      {item.partNumber ?? item.targetId}
                      {item.revisionCode ? ` (Rev ${item.revisionCode})` : ""}
                    </p>
                    {item.name ? (
                      <p className="truncate text-[11px] text-muted-foreground">{item.name}</p>
                    ) : null}
                  </button>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {item.partNumber ?? item.targetId}
                      {item.revisionCode ? ` (Rev ${item.revisionCode})` : ""}
                    </p>
                    {item.name ? (
                      <p className="truncate text-[11px] text-muted-foreground">{item.name}</p>
                    ) : null}
                  </div>
                )}
                {item.itemType === "LIFECYCLE_CHANGE" ? (
                  <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0">
                    {itemTypeLabel(item.itemType)}
                  </Badge>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground/50">변경 대상 없음</p>
      )}
    </div>
  );
}

/* ── 영향 받는 상위 부품 섹션 ── */

interface WhereUsedImpactSectionProps {
  items: AffectedItemDisplayItem[];
  onNavigateToItem?: AffectedItemPickerSectionProps["onNavigateToItem"];
}

function WhereUsedImpactSection({
  items,
  onNavigateToItem,
}: WhereUsedImpactSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">
          영향 받는 상위 부품
          {items.length > 0 ? (
            <span className="ml-1 text-muted-foreground/50">({items.length})</span>
          ) : null}
        </h3>
      </div>

      {items.length > 0 ? (
        <div className="mt-2 space-y-1">
          {items.map((item) => {
            const canNavigate = onNavigateToItem && item.partId && item.targetId;
            return (
              <div
                key={item.id}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
              >
                <ItemTypeIcon itemType={item.itemType} />
                {canNavigate ? (
                  <button
                    type="button"
                    className="min-w-0 flex-1 cursor-pointer text-left"
                    onClick={() => onNavigateToItem!({ partId: item.partId!, revisionId: item.targetId })}
                  >
                    <p className="truncate text-xs font-medium text-foreground">
                      {item.partNumber ?? item.targetId}
                      {item.revisionCode ? ` (Rev ${item.revisionCode})` : ""}
                    </p>
                    {item.name ? (
                      <p className="truncate text-[11px] text-muted-foreground">{item.name}</p>
                    ) : null}
                  </button>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {item.partNumber ?? item.targetId}
                      {item.revisionCode ? ` (Rev ${item.revisionCode})` : ""}
                    </p>
                    {item.name ? (
                      <p className="truncate text-[11px] text-muted-foreground">{item.name}</p>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground/50">
변경 대상 부품을 추가하면 자동으로 채워집니다
        </p>
      )}
    </div>
  );
}
