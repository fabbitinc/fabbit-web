import type { ComponentType } from "react";
import { cn } from "@fabbit/ui";

export interface SummaryCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  sub?: string;
  onClick?: () => void;
  className?: string;
}

export function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  onClick,
  className,
}: SummaryCardProps) {
  const content = (
    <>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
    </>
  );

  if (!onClick) {
    return (
      <div className={cn("flex flex-col gap-1 rounded-lg border border-border bg-card p-4 text-left", className)}>
        {content}
      </div>
    );
  }

  return (
    <button
      className={cn(
        "group flex cursor-pointer flex-col gap-1 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-border/80 hover:bg-accent/40",
        className,
      )}
      type="button"
      onClick={onClick}
    >
      {content}
    </button>
  );
}
