import type { ReactNode } from "react";
import { MoreHorizontal, Pencil } from "lucide-react";
import { Badge, Button } from "@fabbit/ui";

export interface PartHeaderCardPart {
  partNumber: string;
  name: string | null;
  description?: string | null;
  revision: string;
  material: string | null;
  unit: string | null;
  category: string | null;
  lifecycleState: string | null;
  childrenCount: number;
  parentsCount: number;
  suppliersCount: number;
  filesCount: number;
  projectsCount: number;
}

export interface PartHeaderCardProps {
  part: PartHeaderCardPart;
  actions?: ReactNode;
}

function LifecycleBadge({ state }: { state: string | null }) {
  if (!state) {
    return <span className="text-muted-foreground/40">—</span>;
  }

  const className =
    state === "양산"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : state === "개발"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-muted bg-muted/50 text-muted-foreground";

  return (
    <Badge className={className} variant="outline">
      {state}
    </Badge>
  );
}

function DefaultActions() {
  return (
    <div className="flex items-center gap-1.5">
      <Button size="sm" type="button" variant="outline">
        <Pencil className="h-3.5 w-3.5" />
        편집
      </Button>
      <Button size="icon-sm" type="button" variant="outline">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function PartHeaderCard({ part, actions }: PartHeaderCardProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-xl font-bold text-foreground">{part.partNumber}</h1>
            <LifecycleBadge state={part.lifecycleState} />
          </div>
          {actions ?? <DefaultActions />}
        </div>

        {part.name ? <p className="mt-1 text-base text-foreground">{part.name}</p> : null}

        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1.5 sm:grid-cols-4">
          <div>
            <dt className="text-[10px] text-muted-foreground/60">리비전</dt>
            <dd className="text-sm font-medium text-foreground">{part.revision || "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground/60">재질</dt>
            <dd className="text-sm text-foreground">{part.material ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground/60">카테고리</dt>
            <dd className="text-sm text-foreground">{part.category ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground/60">단위</dt>
            <dd className="text-sm text-foreground">{part.unit ?? "—"}</dd>
          </div>
        </div>

        {part.description ? <p className="mt-3 truncate text-sm text-muted-foreground">{part.description}</p> : null}
      </div>
    </div>
  );
}
