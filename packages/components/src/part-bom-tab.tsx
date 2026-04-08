import { AlertTriangle, ExternalLink, Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, Button } from "@fabbit/ui";

export type PartBomRevisionStatus = "DRAFT" | "RELEASED" | "SUPERSEDED" | "CANCELED";

export interface PartBomTabItem {
  id: string;
  bomItemId: string | null;
  partId: string | null;
  revisionId: string | null;
  partNumber: string;
  name: string | null;
  lineNumber: string | null;
  quantity: number;
  revisionCode: string | null;
  revisionStatus: PartBomRevisionStatus | null;
}

export interface PartBomTabProps {
  childrenItems: PartBomTabItem[];
  isLoading?: boolean;
  showLoadingIndicator?: boolean;
  canEdit?: boolean;
  onExploreBom?: () => void;
  onPartClick?: (partId: string, revisionId: string) => void;
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
  onPartClick?: (partId: string, revisionId: string) => void;
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
            onClick={() => { if (item.partId && item.revisionId) onPartClick?.(item.partId, item.revisionId); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (item.partId && item.revisionId) onPartClick?.(item.partId, item.revisionId);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted/70 p-2">
                <Package className="size-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-mono text-xs font-medium text-foreground">{item.partNumber}</p>
                  {item.revisionCode ? (
                    <span className="text-[11px] text-muted-foreground">Rev {item.revisionCode}</span>
                  ) : null}
                  <BomRevisionStatusBadge status={item.revisionStatus} />
                </div>
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

function BomRevisionStatusBadge({ status }: { status: PartBomRevisionStatus | null }) {
  if (!status || status === "RELEASED") return null;

  if (status === "SUPERSEDED") {
    return (
      <Badge variant="outline" className="gap-0.5 border-amber-300 bg-amber-50 px-1.5 py-0 text-[10px] font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400">
        <AlertTriangle className="size-2.5" />
        대체됨
      </Badge>
    );
  }

  if (status === "DRAFT") {
    return (
      <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium text-blue-600 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400">
        초안
      </Badge>
    );
  }

  if (status === "CANCELED") {
    return (
      <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium text-destructive border-destructive/30 bg-destructive/5">
        폐기됨
      </Badge>
    );
  }

  return null;
}

export function PartBomTab({
  childrenItems,
  isLoading = false,
  showLoadingIndicator = false,
  canEdit = false,
  onExploreBom,
  onPartClick,
  onAddItem,
  onBatchAddItems,
  onEditItem,
  onDeleteItem,
}: PartBomTabProps) {
  return (
    <PartBomSection
      actionLabel="BOM 전체 보기"
      description={`${childrenItems.length}개의 하위 부품이 연결되어 있습니다.`}
      emptyLabel="하위 부품이 없습니다."
      isLoading={isLoading}
      showLoadingIndicator={showLoadingIndicator}
      items={childrenItems}
      title="BOM"
      canEdit={canEdit}
      onActionClick={onExploreBom}
      onPartClick={onPartClick}
      onAddItem={onAddItem}
      onBatchAddItems={onBatchAddItems}
      onEditItem={onEditItem}
      onDeleteItem={onDeleteItem}
    />
  );
}
