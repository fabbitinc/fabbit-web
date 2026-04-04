import { ExternalLink, Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@fabbit/ui";

export type PartBomTabDirection = "forward" | "reverse";

export interface PartBomTabItem {
  id: string;
  bomItemId: string | null;
  partNumber: string;
  name: string | null;
  lineNumber: string | null;
  quantity: number;
}

export interface PartBomTabProps {
  childrenItems: PartBomTabItem[];
  parentItems: PartBomTabItem[];
  isLoading?: boolean;
  showLoadingIndicator?: boolean;
  canEdit?: boolean;
  onExploreDirectionChange?: (direction: PartBomTabDirection) => void;
  onPartClick?: (partId: string) => void;
  onAddItem?: () => void;
  onBatchAddItems?: () => void;
  onEditItem?: (item: PartBomTabItem) => void;
  onDeleteItem?: (item: PartBomTabItem) => void;
}

interface PartBomSectionProps {
  actionLabel: string;
  description: string;
  emptyLabel: string;
  items: PartBomTabItem[];
  isLoading: boolean;
  showLoadingIndicator: boolean;
  title: string;
  canEdit?: boolean;
  onActionClick?: () => void;
  onPartClick?: (partId: string) => void;
  onAddItem?: () => void;
  onBatchAddItems?: () => void;
  onEditItem?: (item: PartBomTabItem) => void;
  onDeleteItem?: (item: PartBomTabItem) => void;
}

function PartBomSection({
  actionLabel,
  description,
  emptyLabel,
  items,
  isLoading,
  showLoadingIndicator,
  title,
  canEdit,
  onActionClick,
  onPartClick,
  onAddItem,
  onBatchAddItems,
  onEditItem,
  onDeleteItem,
}: PartBomSectionProps) {
  return (
    <section aria-busy={isLoading} className="app-panel rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {showLoadingIndicator ? (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              불러오는 중
            </div>
          ) : null}
          {canEdit && onAddItem ? (
            <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
              <Plus className="size-4" />
              항목 추가
            </Button>
          ) : null}
          {canEdit && onBatchAddItems ? (
            <Button type="button" variant="outline" size="sm" onClick={onBatchAddItems}>
              <Plus className="size-4" />
              일괄 추가
            </Button>
          ) : null}
          {items.length > 0 && onActionClick ? (
            <Button type="button" variant="outline" size="sm" onClick={onActionClick}>
              <ExternalLink className="size-4" />
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <p className="rounded-md border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : null}
        {items.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            className="flex w-full cursor-pointer items-center justify-between rounded-md border border-border/70 bg-card px-4 py-3 text-left"
            onClick={() => onPartClick?.(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPartClick?.(item.id);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted/70 p-2">
                <Package className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-mono text-xs font-medium text-foreground">{item.partNumber}</p>
                <p className="text-sm text-muted-foreground">{item.name ?? "이름 없음"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">x{item.quantity}</span>
              {canEdit && item.bomItemId && onEditItem ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditItem(item);
                  }}
                >
                  <Pencil className="size-3.5" />
                </Button>
              ) : null}
              {canEdit && item.bomItemId && onDeleteItem ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PartBomTab({
  childrenItems,
  parentItems,
  isLoading = false,
  showLoadingIndicator = false,
  canEdit = false,
  onExploreDirectionChange,
  onPartClick,
  onAddItem,
  onBatchAddItems,
  onEditItem,
  onDeleteItem,
}: PartBomTabProps) {
  return (
    <div className="space-y-8">
      <PartBomSection
        actionLabel="BOM 전체 보기"
        description={`${childrenItems.length}개의 하위 부품이 연결되어 있습니다.`}
        emptyLabel="하위 부품이 없습니다."
        isLoading={isLoading}
        showLoadingIndicator={showLoadingIndicator}
        items={childrenItems}
        title="하위 부품"
        canEdit={canEdit}
        onActionClick={onExploreDirectionChange ? () => onExploreDirectionChange("forward") : undefined}
        onPartClick={onPartClick}
        onAddItem={onAddItem}
        onBatchAddItems={onBatchAddItems}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
      />

      <PartBomSection
        actionLabel="역전개 보기"
        description={`${parentItems.length}개의 상위 부품이 이 부품을 사용합니다.`}
        emptyLabel="상위 부품이 없습니다."
        isLoading={isLoading}
        showLoadingIndicator={showLoadingIndicator}
        items={parentItems}
        title="상위 부품"
        onActionClick={onExploreDirectionChange ? () => onExploreDirectionChange("reverse") : undefined}
        onPartClick={onPartClick}
      />
    </div>
  );
}
