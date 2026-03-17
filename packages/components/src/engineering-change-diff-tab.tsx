import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge, cn } from "@fabbit/ui";

export interface EngineeringChangeDiffPartSnapshot {
  part_number: string;
  name: string;
  revision: string;
  category: string | null;
  lifecycle_state: string | null;
  material: string | null;
  unit: string | null;
  description: string | null;
  is_phantom: boolean;
  lead_time_days: number | null;
}

export type EngineeringChangeDiffItemType = "modified" | "added" | "removed";

export interface EngineeringChangeDiffItem {
  id: string;
  partId?: string;
  type: EngineeringChangeDiffItemType;
  before: EngineeringChangeDiffPartSnapshot | null;
  after: EngineeringChangeDiffPartSnapshot | null;
}

export interface EngineeringChangeDiffChanges {
  items: EngineeringChangeDiffItem[];
}

export interface EngineeringChangeDiffTabProps {
  changes?: EngineeringChangeDiffChanges;
  emptyMessage?: string;
}

const FIELD_LABELS: { key: keyof EngineeringChangeDiffPartSnapshot; label: string }[] = [
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

const TYPE_LABEL: Record<EngineeringChangeDiffItemType, string> = {
  modified: "수정",
  added: "추가",
  removed: "삭제",
};

const TYPE_BADGE_CLASS: Record<EngineeringChangeDiffItemType, string> = {
  modified: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  added: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  removed: "border-red-500/40 bg-red-500/10 text-red-700",
};

const DEFAULT_CHANGES: EngineeringChangeDiffChanges = {
  items: [
    {
      id: "ci1",
      partId: "p1",
      type: "modified",
      before: {
        part_number: "HSG-002",
        name: "모터 하우징",
        revision: "B",
        category: "하우징",
        lifecycle_state: "production",
        material: "AL6061-T6",
        unit: "EA",
        description: "BLDC 400W 모터 하우징 (아노다이징)",
        is_phantom: false,
        lead_time_days: 14,
      },
      after: {
        part_number: "HSG-002",
        name: "모터 하우징",
        revision: "C",
        category: "하우징",
        lifecycle_state: "production",
        material: "AL6061-T6",
        unit: "EA",
        description: "BLDC 400W 모터 하우징 (니켈도금, 방열핀 추가)",
        is_phantom: false,
        lead_time_days: 18,
      },
    },
    {
      id: "ci2",
      partId: "p2",
      type: "added",
      before: null,
      after: {
        part_number: "FIN-010",
        name: "방열핀",
        revision: "A",
        category: "방열",
        lifecycle_state: "prototype",
        material: "AL1050",
        unit: "EA",
        description: "모터 하우징 체결용 방열핀 4ea 세트",
        is_phantom: false,
        lead_time_days: 7,
      },
    },
  ],
};

function formatValue(key: keyof EngineeringChangeDiffPartSnapshot, value: unknown): string {
  if (value == null) {
    return "—";
  }

  if (key === "is_phantom") {
    return value ? "예" : "아니오";
  }

  if (key === "lead_time_days") {
    return `${value}일`;
  }

  return String(value);
}

function PartDiffCard({ item }: { item: EngineeringChangeDiffItem }) {
  const [isOpen, setIsOpen] = useState(true);
  const partNumber = item.after?.part_number ?? item.before?.part_number ?? "—";
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
      <button
        type="button"
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-muted/40",
          isOpen && "border-b",
        )}
        onClick={() => setIsOpen((current) => !current)}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-90",
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

      {isOpen ? (
        isModified ? (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                <th className="w-28 py-2 pl-4 pr-2 text-left font-medium">속성</th>
                <th className="px-2 py-2 text-left font-medium">변경 전</th>
                <th className="px-2 py-2 text-left font-medium">변경 후</th>
              </tr>
            </thead>
            <tbody>
              {FIELD_LABELS.map(({ key, label }) => {
                const beforeValue = formatValue(key, item.before?.[key]);
                const afterValue = formatValue(key, item.after?.[key]);
                const isChanged = beforeValue !== afterValue;

                return (
                  <tr
                    key={key}
                    className={cn(
                      "border-b border-border/40 last:border-b-0",
                      isChanged && "bg-amber-500/5",
                    )}
                  >
                    <td className="w-28 py-2 pl-4 pr-2 text-xs text-muted-foreground">
                      {label}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-2 text-sm",
                        isChanged
                          ? "text-red-600 line-through"
                          : "text-foreground",
                      )}
                    >
                      {beforeValue}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-2 text-sm",
                        isChanged
                          ? "font-medium text-emerald-700"
                          : "text-foreground",
                      )}
                    >
                      {afterValue}
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
                <th className="px-2 py-2 text-left font-medium">값</th>
              </tr>
            </thead>
            <tbody>
              {FIELD_LABELS.map(({ key, label }) => (
                <tr key={key} className="border-b border-border/40 last:border-b-0">
                  <td className="w-28 py-2 pl-4 pr-2 text-xs text-muted-foreground">
                    {label}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2 text-sm",
                      !isAdded && "text-red-600 line-through",
                    )}
                  >
                    {formatValue(key, (isAdded ? item.after : item.before)?.[key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : null}
    </div>
  );
}

export function EngineeringChangeDiffTab({
  changes = DEFAULT_CHANGES,
  emptyMessage = "변경 내용이 없습니다",
}: EngineeringChangeDiffTabProps) {
  if (!changes.items.length) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-16 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const counts = changes.items.reduce(
    (accumulator, item) => {
      accumulator[item.type] += 1;
      return accumulator;
    },
    { modified: 0, added: 0, removed: 0 } as Record<EngineeringChangeDiffItemType, number>,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>
          부품 <span className="font-medium text-foreground">{changes.items.length}</span>개 변경
        </span>
        {counts.modified > 0 ? (
          <>
            <span>·</span>
            <span className="text-amber-600">수정 {counts.modified}</span>
          </>
        ) : null}
        {counts.added > 0 ? (
          <>
            <span>·</span>
            <span className="text-emerald-600">추가 {counts.added}</span>
          </>
        ) : null}
        {counts.removed > 0 ? (
          <>
            <span>·</span>
            <span className="text-red-600">삭제 {counts.removed}</span>
          </>
        ) : null}
      </div>

      {changes.items.map((item) => (
        <PartDiffCard key={item.id} item={item} />
      ))}
    </div>
  );
}
