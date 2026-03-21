import type { EntityDetailBlock } from "../types/chat-artifact";

interface EntityDetailCardProps {
  artifact: EntityDetailBlock;
}

const ENTITY_LABELS: Record<string, string> = {
  part: "부품 상세",
  issue: "이슈 상세",
};

export function EntityDetailCard({ artifact }: EntityDetailCardProps) {
  const { entityType, fields } = artifact;
  const label = ENTITY_LABELS[entityType] ?? `${entityType} 상세`;
  const entries = Object.entries(fields).filter(
    ([, value]) => value !== null && value !== undefined,
  );

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <dl className="divide-y divide-border">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-baseline px-3 py-2 text-sm">
            <dt className="w-24 shrink-0 text-muted-foreground">{key}</dt>
            <dd className="min-w-0 flex-1 font-medium">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
