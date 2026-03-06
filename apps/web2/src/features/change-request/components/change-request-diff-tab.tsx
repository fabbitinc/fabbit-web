import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@fabbit/ui";
import { cn } from "@/lib/utils";

type ChangeItemType = "modified" | "added" | "removed";

interface PartFieldChange {
  label: string;
  before?: string;
  after?: string;
}

interface MockChangeItem {
  id: string;
  type: ChangeItemType;
  partNumber: string;
  name: string;
  fields: PartFieldChange[];
}

const mockChangeItems: MockChangeItem[] = [
  {
    id: "change-1",
    type: "modified",
    partNumber: "HSG-002",
    name: "모터 하우징",
    fields: [
      { label: "Revision", before: "B", after: "C" },
      { label: "공차", before: "±0.05", after: "±0.03" },
      { label: "표면처리", before: "아노다이징", after: "니켈도금" },
    ],
  },
  {
    id: "change-2",
    type: "added",
    partNumber: "FIN-010",
    name: "방열핀",
    fields: [
      { label: "카테고리", after: "방열" },
      { label: "수량", after: "4" },
      { label: "재질", after: "AL6061" },
    ],
  },
  {
    id: "change-3",
    type: "removed",
    partNumber: "GKT-003",
    name: "기존 패드",
    fields: [
      { label: "카테고리", before: "절연" },
      { label: "재질", before: "실리콘" },
    ],
  },
];

const typeLabelMap: Record<ChangeItemType, string> = {
  modified: "수정",
  added: "추가",
  removed: "삭제",
};

const typeClassMap: Record<ChangeItemType, string> = {
  modified: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  added: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  removed: "border-red-500/40 bg-red-500/10 text-red-700",
};

function DiffItemCard({ item }: { item: MockChangeItem }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-[24px] border border-border/70 bg-card">
      <button
        type="button"
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/20",
          isOpen && "border-b border-border/70",
        )}
        onClick={() => setIsOpen((current) => !current)}
      >
        <ChevronRight
          className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-90")}
        />
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium text-foreground">{item.partNumber}</p>
          <p className="truncate text-sm text-muted-foreground">{item.name}</p>
        </div>
        <Badge variant="outline" className={cn("ml-auto", typeClassMap[item.type])}>
          {typeLabelMap[item.type]}
        </Badge>
      </button>

      {isOpen ? (
        <div className="px-4 py-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-xs text-muted-foreground">
                <th className="py-2 font-medium">속성</th>
                <th className="py-2 font-medium">변경 전</th>
                <th className="py-2 font-medium">변경 후</th>
              </tr>
            </thead>
            <tbody>
              {item.fields.map((field) => (
                <tr key={field.label} className="border-b border-border/40 last:border-b-0">
                  <td className="py-2 text-muted-foreground">{field.label}</td>
                  <td className="py-2 text-foreground">{field.before ?? "—"}</td>
                  <td className="py-2 text-foreground">{field.after ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export function ChangeRequestDiffTab() {
  return (
    <section className="space-y-4">
      <div className="rounded-[24px] border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
        변경 내용 탭은 레거시와 동일하게 현재 mock 데이터로 유지합니다. 서버 diff 계약이 생기면 실제 변경 비교로 교체합니다.
      </div>

      <div className="space-y-3">
        {mockChangeItems.map((item) => (
          <DiffItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
