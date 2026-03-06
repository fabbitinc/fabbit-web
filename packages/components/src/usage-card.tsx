import type { CSSProperties, ComponentType } from "react";

export interface UsageCardProps {
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  label: string;
  used: number;
  limit: number;
  unit: string;
  warningThreshold?: number;
  color?: string;
  gradient?: string;
  className?: string;
}

export function UsageCard({
  icon: Icon,
  label,
  used,
  limit,
  unit,
  warningThreshold = 80,
  color = "var(--brand-500)",
  gradient,
  className,
}: UsageCardProps) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const isHigh = percent >= warningThreshold;

  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${className ?? ""}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex" style={{ color }}>
          <Icon className="size-3.5" />
        </span>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums text-foreground">{used.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">
          / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="mt-3">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${percent}%`,
              background: gradient ?? color,
            }}
          />
        </div>
      </div>
      {isHigh ? (
        <p className="mt-2 text-xs" style={{ color: "var(--status-danger)" }}>
          사용량이 {percent}%에 도달했습니다
        </p>
      ) : null}
    </div>
  );
}
