import type { ReactNode } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { Badge, Popover, PopoverContent, PopoverTrigger } from "@fabbit/ui";

export type PartRevisionStatus = "DRAFT" | "RELEASED" | "SUPERSEDED" | "CANCELED";

export interface PartHeaderCardPart {
  partNumber: string;
  name: string | null;
  description?: string | null;
  revision: string;
  revisionStatus?: PartRevisionStatus | null;
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

export interface PartRevisionOption {
  revisionId: string;
  revisionCode: string;
  status: PartRevisionStatus;
  currentReleased?: boolean;
}

export interface PartHeaderCardProps {
  part: PartHeaderCardPart;
  actions?: ReactNode;
  /** 리비전 선택기 */
  revisionOptions?: PartRevisionOption[];
  currentRevisionId?: string;
  onRevisionChange?: (revisionId: string) => void;
}

export function PartHeaderCard({ part, actions, revisionOptions, currentRevisionId, onRevisionChange }: PartHeaderCardProps) {
  const hasRevisionSelector = revisionOptions && revisionOptions.length > 0 && onRevisionChange;
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono text-xl font-bold text-foreground">{part.partNumber}</span>
              <span className="text-muted-foreground/40">/</span>
              {hasRevisionSelector ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      REV {part.revision || "—"}
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1" align="start">
                    <div className="max-h-60 overflow-auto">
                      {revisionOptions.map((opt) => (
                        <button
                          key={opt.revisionId}
                          type="button"
                          className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                            opt.revisionId === currentRevisionId ? "bg-muted/70 font-medium" : ""
                          }`}
                          onClick={() => onRevisionChange(opt.revisionId)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-foreground">Rev {opt.revisionCode}</span>
                            <RevisionStatusBadge status={opt.status} />
                          </div>
                          {opt.currentReleased ? (
                            <span className="text-[10px] text-muted-foreground">최신</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <span className="font-medium text-foreground">
                  REV {part.revision || "—"}
                </span>
              )}
              <RevisionStatusBadge status={part.revisionStatus} />
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

function RevisionStatusBadge({ status }: { status?: PartRevisionStatus | null }) {
  if (!status || status === "RELEASED") return null;

  if (status === "SUPERSEDED") {
    return (
      <Badge variant="outline" className="gap-0.5 border-amber-300 bg-amber-50 px-1.5 py-0 text-[10px] font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400">
        <AlertTriangle className="size-2.5" />
        대체됨
      </Badge>
    );
  }

  if (status === "DRAFT") {
    return (
      <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium text-blue-600 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400">
        초안
      </Badge>
    );
  }

  if (status === "CANCELED") {
    return (
      <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium text-destructive border-destructive/30 bg-destructive/5">
        폐기됨
      </Badge>
    );
  }

  return null;
}
