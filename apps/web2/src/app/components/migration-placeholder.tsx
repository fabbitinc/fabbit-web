import type { ReactNode } from "react";
import { Badge, Button } from "@fabbit/ui";

interface MigrationPlaceholderProps {
  title: string;
  description: string;
  notes?: ReactNode;
}

export function MigrationPlaceholder({
  title,
  description,
  notes,
}: MigrationPlaceholderProps) {
  return (
    <section className="app-panel rounded-[28px] p-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <Badge variant="accent">이관 중</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <Button disabled variant="outline">
          작업 진행 중
        </Button>
      </div>
      {notes ? <div className="rounded-2xl border border-dashed border-border/80 bg-muted/50 p-4 text-sm text-muted-foreground">{notes}</div> : null}
    </section>
  );
}
