import { useCallback, useEffect, useState } from "react";
import { FileText, Loader2, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
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
} from "@fabbit/ui";
import { lookupParts } from "@/features/change-shared/api/change-shared.api";
import type { LookupPartModel } from "@/features/change-shared/types/change-shared-model";
import type { EngineeringChangeAffectedItemModel } from "@/features/engineering-change/types/engineering-change-model";
import { useSyncAffectedItemsAction } from "@/features/engineering-change/hooks/use-sync-affected-items-action";

interface EcAffectedItemsSectionProps {
  engineeringChangeId: string;
  affectedItems: EngineeringChangeAffectedItemModel[];
  isEditable: boolean;
}

/** 영향 항목 유형 라벨 */
function itemTypeLabel(itemType: string): string {
  if (itemType === "LIFECYCLE_CHANGE") {
    return "Lifecycle 변경";
  }

  return "리비전 릴리즈";
}

/** 영향 항목 유형 아이콘 */
function ItemTypeIcon({ itemType }: { itemType: string }) {
  if (itemType === "LIFECYCLE_CHANGE") {
    return <RefreshCw className="size-4 text-muted-foreground" />;
  }

  return <FileText className="size-4 text-muted-foreground" />;
}

export function EcAffectedItemsSection({
  engineeringChangeId,
  affectedItems,
  isEditable,
}: EcAffectedItemsSectionProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const syncAction = useSyncAffectedItemsAction(engineeringChangeId);

  /** 항목 삭제 후 즉시 sync */
  const handleRemoveItem = useCallback(
    (itemId: string) => {
      const remaining = affectedItems.filter((item) => item.id !== itemId);
      syncAction.mutate({
        items: remaining.map((item) => ({
          item_type: item.itemType,
          target_id: item.targetId,
        })),
      });
    },
    [affectedItems, syncAction],
  );

  /** Picker에서 항목 추가 완료 시 */
  const handleAddItems = useCallback(
    (newItems: { targetId: string; itemType: "REVISION_RELEASE" | "LIFECYCLE_CHANGE" }[]) => {
      const existingTargetIds = new Set(affectedItems.map((item) => item.targetId));
      const deduped = newItems.filter((item) => !existingTargetIds.has(item.targetId));

      if (deduped.length === 0) {
        setIsPickerOpen(false);
        return;
      }

      const merged = [
        ...affectedItems.map((item) => ({
          item_type: item.itemType as "REVISION_RELEASE" | "LIFECYCLE_CHANGE",
          target_id: item.targetId,
        })),
        ...deduped.map((item) => ({
          item_type: item.itemType,
          target_id: item.targetId,
        })),
      ];

      syncAction.mutate({ items: merged }, {
        onSuccess: () => setIsPickerOpen(false),
      });
    },
    [affectedItems, syncAction],
  );

  /** 빈 상태 */
  if (affectedItems.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">영향 항목</h3>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border/70 bg-muted/20 px-6 py-8 text-center">
          <p className="text-sm leading-6 text-muted-foreground">
            영향 항목을 추가하여 이 변경이 어떤 부품에 영향을 주는지 명시하세요
          </p>
          {isEditable ? (
            <Button variant="outline" size="sm" onClick={() => setIsPickerOpen(true)}>
              <Plus className="size-4" />
              추가
            </Button>
          ) : null}
        </div>

        {isEditable ? (
          <AffectedItemPickerDialog
            open={isPickerOpen}
            onOpenChange={setIsPickerOpen}
            onConfirm={handleAddItems}
            isPending={syncAction.isPending}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">영향 항목</h3>
        {isEditable ? (
          <Button variant="ghost" size="xs" onClick={() => setIsPickerOpen(true)}>
            <Plus className="size-3.5" />
            추가
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        {affectedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-md border border-border/70 bg-card px-3 py-2"
          >
            <ItemTypeIcon itemType={item.itemType} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.partNumber ?? item.targetId}
                {item.revisionCode ? ` (Rev ${item.revisionCode})` : ""}
              </p>
              {item.name ? (
                <p className="truncate text-xs text-muted-foreground">{item.name}</p>
              ) : null}
            </div>
            <Badge variant="outline" className="shrink-0 text-xs">
              {itemTypeLabel(item.itemType)}
            </Badge>
            {isEditable ? (
              <Button
                variant="ghost"
                size="icon-xs"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                aria-label={`${item.partNumber ?? "항목"} 삭제`}
                disabled={syncAction.isPending}
                onClick={() => handleRemoveItem(item.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      {isEditable ? (
        <AffectedItemPickerDialog
          open={isPickerOpen}
          onOpenChange={setIsPickerOpen}
          onConfirm={handleAddItems}
          isPending={syncAction.isPending}
        />
      ) : null}
    </div>
  );
}

/* ── Picker Dialog ── */

interface AffectedItemPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (items: { targetId: string; itemType: "REVISION_RELEASE" | "LIFECYCLE_CHANGE" }[]) => void;
  isPending: boolean;
}

function AffectedItemPickerDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: AffectedItemPickerDialogProps) {
  const [search, setSearch] = useState("");
  const [parts, setParts] = useState<LookupPartModel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedParts, setSelectedParts] = useState<Map<string, LookupPartModel>>(new Map());
  const [itemType, setItemType] = useState<"REVISION_RELEASE" | "LIFECYCLE_CHANGE">("REVISION_RELEASE");

  /** Dialog가 닫힐 때 상태 초기화 */
  useEffect(() => {
    if (!open) {
      setSearch("");
      setParts([]);
      setSelectedParts(new Map());
      setItemType("REVISION_RELEASE");
    }
  }, [open]);

  /** 검색 디바운스 */
  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(async () => {
      const query = search.trim();
      if (query.length === 0) {
        setParts([]);
        return;
      }

      setIsSearching(true);

      try {
        const result = await lookupParts({ search: query, limit: 20 });
        setParts(result);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, open]);

  const togglePart = (part: LookupPartModel) => {
    setSelectedParts((prev) => {
      const next = new Map(prev);
      if (next.has(part.id)) {
        next.delete(part.id);
      } else {
        next.set(part.id, part);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const items = Array.from(selectedParts.values()).map((part) => ({
      targetId: part.id,
      itemType,
    }));
    onConfirm(items);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>영향 항목 추가</DialogTitle>
          <DialogDescription>부품을 검색하여 영향 항목으로 추가합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 유형 선택 */}
          <div className="flex gap-2">
            <Button
              variant={itemType === "REVISION_RELEASE" ? "default" : "outline"}
              size="sm"
              onClick={() => setItemType("REVISION_RELEASE")}
            >
              <FileText className="size-4" />
              리비전 릴리즈
            </Button>
            <Button
              variant={itemType === "LIFECYCLE_CHANGE" ? "default" : "outline"}
              size="sm"
              onClick={() => setItemType("LIFECYCLE_CHANGE")}
            >
              <RefreshCw className="size-4" />
              Lifecycle 변경
            </Button>
          </div>

          {/* 검색 입력 */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="품번 또는 이름으로 부품 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* 검색 결과 */}
          <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-lg border border-border/70 bg-muted/20 p-3">
            {isSearching ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : null}

            {!isSearching && search.trim().length > 0 && parts.length === 0 ? (
              <div className="flex h-40 items-center justify-center px-6 text-center text-sm leading-6 text-muted-foreground">
                검색 조건에 맞는 부품이 없습니다.
              </div>
            ) : null}

            {!isSearching && search.trim().length === 0 ? (
              <div className="flex h-40 items-center justify-center px-6 text-center text-sm leading-6 text-muted-foreground">
                품번 또는 이름을 입력하여 검색하세요.
              </div>
            ) : null}

            {parts.map((part) => {
              const isSelected = selectedParts.has(part.id);
              return (
                <button
                  key={part.id}
                  type="button"
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/70 bg-card hover:bg-accent/50"
                  }`}
                  onClick={() => togglePart(part)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{part.partNumber}</p>
                    {part.name ? (
                      <p className="truncate text-sm text-muted-foreground">{part.name}</p>
                    ) : null}
                  </div>
                  {isSelected ? (
                    <Badge variant="default" className="shrink-0">선택됨</Badge>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* 선택된 항목 요약 */}
          {selectedParts.size > 0 ? (
            <p className="text-sm text-muted-foreground">
              {selectedParts.size}개 부품 선택됨
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            type="button"
            disabled={selectedParts.size === 0 || isPending}
            onClick={handleConfirm}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            선택한 항목 추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
