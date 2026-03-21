import { Badge } from "@fabbit/ui";
import type { EntityListBlock } from "../types/chat-artifact";

interface EntityListCardProps {
  artifact: EntityListBlock;
}

const ENTITY_LABELS: Record<string, string> = {
  part: "부품",
  issue: "이슈",
};

export function EntityListCard({ artifact }: EntityListCardProps) {
  const { entityType, items } = artifact;
  const label = ENTITY_LABELS[entityType] ?? entityType;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        {label} 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {label} 목록
        </span>
        <Badge variant="secondary" className="ml-2 text-xs">
          {items.length}건
        </Badge>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <span className="font-medium">
                {getItemLabel(item, entityType)}
              </span>
              {getItemDescription(item, entityType) && (
                <span className="ml-2 text-muted-foreground">
                  {getItemDescription(item, entityType)}
                </span>
              )}
            </div>
            {getItemStatus(item) && (
              <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                {getItemStatus(item)}
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getItemLabel(
  item: Record<string, unknown>,
  entityType: string,
): string {
  if (entityType === "part") {
    return [item.number, item.name].filter(Boolean).join(" · ") || String(item.id);
  }
  if (entityType === "issue") {
    return [item.issueNumber, item.title].filter(Boolean).join(" ") || String(item.id);
  }
  return String(item.name ?? item.title ?? item.id);
}

function getItemDescription(
  item: Record<string, unknown>,
  entityType: string,
): string | null {
  if (entityType === "part" && item.revision) return `Rev.${item.revision}`;
  return null;
}

function getItemStatus(item: Record<string, unknown>): string | null {
  if (typeof item.status === "string") return item.status;
  return null;
}
