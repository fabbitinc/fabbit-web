import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  CRChanges,
  ChangeItem,
  ChangeItemType,
  PartSnapshot,
} from "./changeRequestMock";

// ============================================================
// 속성 라벨 매핑 (PartDetailPage PropertiesTab 패턴 재사용)
// ============================================================

const FIELD_LABELS: { key: keyof PartSnapshot; label: string }[] = [
  { key: "part_number", label: "품번" },
  { key: "name", label: "품명" },
  { key: "revision", label: "리비전" },
  { key: "category", label: "카테고리" },
  { key: "lifecycle_state", label: "상태" },
  { key: "material", label: "재질" },
  { key: "unit", label: "단위" },
  { key: "description", label: "설명" },
  { key: "is_phantom", label: "팬텀" },
  { key: "lead_time_days", label: "리드타임" },
];

// ============================================================
// 헬퍼
// ============================================================

const TYPE_LABEL: Record<ChangeItemType, string> = {
  modified: "수정",
  added: "추가",
  removed: "삭제",
};

const TYPE_BADGE_CLASS: Record<ChangeItemType, string> = {
  modified: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  added: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  removed: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
};

function formatValue(key: keyof PartSnapshot, value: unknown): string {
  if (value == null) return "—";
  if (key === "is_phantom") return value ? "예" : "아니오";
  if (key === "lead_time_days") return `${value}일`;
  return String(value);
}

// ============================================================
// PartDiffCard
// ============================================================

function PartDiffCard({ item }: { item: ChangeItem }) {
  const [open, setOpen] = useState(true);
  const partNumber =
    item.after?.part_number ?? item.before?.part_number ?? "—";
  const partName = item.after?.name ?? item.before?.name ?? "";

  const isModified = item.type === "modified" && item.before && item.after;
  const isAdded = item.type === "added";

  const borderClass = isModified
    ? ""
    : isAdded
      ? "border-emerald-500/30 bg-emerald-500/[0.03]"
      : "border-red-500/30 bg-red-500/[0.03]";

  return (
    <div className={cn("rounded-lg border", borderClass)}>
      {/* 클릭 가능한 헤더 */}
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-muted/40",
          open && "border-b",
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90",
          )}
        />
        <span className="font-mono text-xs font-medium">{partNumber}</span>
        <span className="text-sm text-muted-foreground">{partName}</span>
        <Badge
          variant="outline"
          className={cn("ml-auto text-[10px]", TYPE_BADGE_CLASS[item.type])}
        >
          {TYPE_LABEL[item.type]}
        </Badge>
      </button>

      {/* 접기/펼치기 본문 */}
      {open && (
        <>
          {isModified ? (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="w-28 py-2 pl-4 pr-2 text-left font-medium">속성</th>
                  <th className="py-2 px-2 text-left font-medium">변경 전</th>
                  <th className="py-2 px-2 text-left font-medium">변경 후</th>
                </tr>
              </thead>
              <tbody>
                {FIELD_LABELS.map(({ key, label }) => {
                  const bVal = formatValue(key, item.before![key]);
                  const aVal = formatValue(key, item.after![key]);
                  const changed = bVal !== aVal;
                  return (
                    <tr
                      key={key}
                      className={cn(
                        "border-b border-border/40 last:border-b-0",
                        changed && "bg-amber-500/5",
                      )}
                    >
                      <td className="w-28 py-2 pl-4 pr-2 text-xs text-muted-foreground">
                        {label}
                      </td>
                      <td
                        className={cn(
                          "py-2 px-2 text-sm",
                          changed
                            ? "text-red-600 line-through dark:text-red-400"
                            : "text-foreground",
                        )}
                      >
                        {bVal}
                      </td>
                      <td
                        className={cn(
                          "py-2 px-2 text-sm",
                          changed
                            ? "font-medium text-emerald-700 dark:text-emerald-400"
                            : "text-foreground",
                        )}
                      >
                        {aVal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="w-28 py-2 pl-4 pr-2 text-left font-medium">속성</th>
                  <th className="py-2 px-2 text-left font-medium">값</th>
                </tr>
              </thead>
              <tbody>
                {FIELD_LABELS.map(({ key, label }) => (
                  <tr
                    key={key}
                    className="border-b border-border/40 last:border-b-0"
                  >
                    <td className="w-28 py-2 pl-4 pr-2 text-xs text-muted-foreground">
                      {label}
                    </td>
                    <td
                      className={cn(
                        "py-2 px-2 text-sm",
                        !isAdded && "text-red-600 line-through dark:text-red-400",
                      )}
                    >
                      {formatValue(key, (isAdded ? item.after : item.before)![key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// ChangesDiffTab (메인 export)
// ============================================================

export function ChangesDiffTab({ changes }: { changes: CRChanges | undefined }) {
  if (!changes || changes.items.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-16 text-sm text-muted-foreground">
        변경 내용이 없습니다
      </div>
    );
  }

  const counts = changes.items.reduce(
    (acc, item) => {
      acc[item.type]++;
      return acc;
    },
    { modified: 0, added: 0, removed: 0 } as Record<ChangeItemType, number>,
  );

  return (
    <div className="space-y-4">
      {/* 요약 헤더 */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>
          부품 <span className="font-medium text-foreground">{changes.items.length}</span>개 변경
        </span>
        {counts.modified > 0 && (
          <>
            <span>·</span>
            <span className="text-amber-600 dark:text-amber-400">수정 {counts.modified}</span>
          </>
        )}
        {counts.added > 0 && (
          <>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400">추가 {counts.added}</span>
          </>
        )}
        {counts.removed > 0 && (
          <>
            <span>·</span>
            <span className="text-red-600 dark:text-red-400">삭제 {counts.removed}</span>
          </>
        )}
      </div>

      {/* diff 카드 목록 */}
      {changes.items.map((item) => (
        <PartDiffCard key={item.id} item={item} />
      ))}
    </div>
  );
}
