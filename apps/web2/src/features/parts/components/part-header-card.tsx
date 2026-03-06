import { Badge } from "@fabbit/ui";
import type { PartDetailModel } from "@/features/parts/types/parts-model";

function getLifecycleVariant(lifecycleState: string | null): "outline" | "neutral" | "accent" | "success" {
  if (lifecycleState === "양산") {
    return "success";
  }

  if (lifecycleState === "중단") {
    return "neutral";
  }

  return "outline";
}

interface PartHeaderCardProps {
  part: PartDetailModel;
}

export function PartHeaderCard({ part }: PartHeaderCardProps) {
  return (
    <section className="app-panel rounded-[32px] p-6 sm:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-xs font-semibold text-primary">
            {part.partNumber}
          </div>
          {part.lifecycleState ? <Badge variant={getLifecycleVariant(part.lifecycleState)}>{part.lifecycleState}</Badge> : null}
          {part.category ? <Badge variant="outline">{part.category}</Badge> : null}
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{part.name ?? part.partNumber}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            리비전 {part.revision} · 재질 {part.material ?? "미지정"} · 단위 {part.unit ?? "미지정"}
          </p>
        </div>

        <div className="grid gap-3 rounded-[24px] border border-border/70 bg-muted/20 px-4 py-4 text-sm sm:grid-cols-2 xl:grid-cols-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Children</p>
            <p className="mt-2 font-medium text-foreground">{part.childrenCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Parents</p>
            <p className="mt-2 font-medium text-foreground">{part.parentsCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Suppliers</p>
            <p className="mt-2 font-medium text-foreground">{part.suppliersCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Files</p>
            <p className="mt-2 font-medium text-foreground">{part.filesCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Projects</p>
            <p className="mt-2 font-medium text-foreground">{part.projectsCount}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
