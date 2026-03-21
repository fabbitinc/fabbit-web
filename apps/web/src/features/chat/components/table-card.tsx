import type { TableBlock } from "../types/chat-artifact";

interface TableCardProps {
  artifact: TableBlock;
}

export function TableCard({ artifact }: TableCardProps) {
  const { columns, rows } = artifact;

  if (columns.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-muted/30 transition-colors">
              {columns.map((_, ci) => (
                <td key={ci} className="px-3 py-2">
                  {String(row[ci] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
