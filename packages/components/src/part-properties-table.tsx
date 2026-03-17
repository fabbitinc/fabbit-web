import type { ReactNode } from "react";
import { cn } from "@fabbit/ui";

export interface PartPropertiesTableRow {
  alignTop?: boolean;
  error?: string;
  label: string;
  required?: boolean;
  value: ReactNode;
}

export interface PartPropertiesTableProps {
  actions?: ReactNode;
  className?: string;
  rows: PartPropertiesTableRow[];
}

export function PartPropertiesTable({
  actions,
  className,
  rows,
}: PartPropertiesTableProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {actions ? <div className="flex justify-end">{actions}</div> : null}

      <div className="rounded-lg border">
        <table className="w-full">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border/40 last:border-b-0">
                <td
                  className={cn(
                    "w-24 py-2.5 pl-4 pr-2 text-xs text-muted-foreground",
                    row.alignTop && "align-top",
                  )}
                >
                  <span className="flex items-center gap-1">
                    {row.label}
                    {row.required ? (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
                    ) : null}
                  </span>
                </td>
                <td
                  className={cn(
                    "py-2.5 pr-4 text-sm text-foreground",
                    row.alignTop && "align-top",
                  )}
                >
                  {row.value}
                  {row.error ? (
                    <p className="mt-1 text-xs text-destructive">{row.error}</p>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
