import type { ReactNode } from "react";

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

export function PartHeaderCard({ part, actions }: PartHeaderCardProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono text-xl font-bold text-foreground">{part.partNumber}</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="font-medium text-foreground">
                REV {part.revision || "—"}
              </span>
            </div>

            <h1 className="mt-2 text-lg font-semibold text-foreground">
              {part.name ?? "품명이 없습니다."}
            </h1>

            {part.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {part.description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="flex shrink-0 items-center justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
