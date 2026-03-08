import { ExternalLink, Package } from "lucide-react";
import { Button } from "@fabbit/ui";

export type PartBomTabDirection = "forward" | "reverse";

export interface PartBomTabItem {
  id: string;
  partNumber: string;
  name: string | null;
  quantity: number;
}

export interface PartBomTabProps {
  childrenItems: PartBomTabItem[];
  parentItems: PartBomTabItem[];
  isLoading?: boolean;
  onExploreDirectionChange?: (direction: PartBomTabDirection) => void;
  onPartClick?: (partId: string) => void;
}

interface PartBomSectionProps {
  actionLabel: string;
  description: string;
  emptyLabel: string;
  items: PartBomTabItem[];
  isLoading: boolean;
  title: string;
  onActionClick?: () => void;
  onPartClick?: (partId: string) => void;
}

function PartBomSection({
  actionLabel,
  description,
  emptyLabel,
  items,
  isLoading,
  title,
  onActionClick,
  onPartClick,
}: PartBomSectionProps) {
  return (
    <section className="app-panel rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {items.length > 0 && onActionClick ? (
          <Button type="button" variant="outline" onClick={onActionClick}>
            <ExternalLink className="size-4" />
            {actionLabel}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? <p className="text-sm text-muted-foreground">BOM을 불러오는 중입니다.</p> : null}
        {!isLoading && items.length === 0 ? (
          <p className="rounded-md border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : null}
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="flex w-full cursor-pointer items-center justify-between rounded-md border border-border/70 bg-card px-4 py-3 text-left"
            onClick={() => onPartClick?.(item.id)}
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
            <span className="text-sm font-medium text-foreground">x{item.quantity}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function PartBomTab({
  childrenItems,
  parentItems,
  isLoading = false,
  onExploreDirectionChange,
  onPartClick,
}: PartBomTabProps) {
  return (
    <div className="space-y-8">
      <PartBomSection
        actionLabel="BOM 전체 보기"
        description={`${childrenItems.length}개의 하위 부품이 연결되어 있습니다.`}
        emptyLabel="하위 부품이 없습니다."
        isLoading={isLoading}
        items={childrenItems}
        title="하위 부품"
        onActionClick={onExploreDirectionChange ? () => onExploreDirectionChange("forward") : undefined}
        onPartClick={onPartClick}
      />

      <PartBomSection
        actionLabel="역전개 보기"
        description={`${parentItems.length}개의 상위 부품이 이 부품을 사용합니다.`}
        emptyLabel="상위 부품이 없습니다."
        isLoading={isLoading}
        items={parentItems}
        title="상위 부품"
        onActionClick={onExploreDirectionChange ? () => onExploreDirectionChange("reverse") : undefined}
        onPartClick={onPartClick}
      />
    </div>
  );
}
