import { Badge } from "@fabbit/ui";

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
}

function getLifecycleVariant(lifecycleState: string | null): "outline" | "neutral" | "accent" | "success" {
  if (lifecycleState === "양산") {
    return "success";
  }

  if (lifecycleState === "중단") {
    return "neutral";
  }

  return "outline";
}

export function PartHeaderCard({ part }: PartHeaderCardProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-xl font-bold text-foreground">{part.partNumber}</h1>
            {part.lifecycleState ? <Badge variant={getLifecycleVariant(part.lifecycleState)}>{part.lifecycleState}</Badge> : null}
          </div>
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
