import type { ReactNode } from "react";

export interface DescriptionItem {
  /** 라벨 (예: "작업지시 번호") */
  label: string;
  /** 값. 문자열 또는 ReactNode */
  value: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** 컬럼 수. 기본값: 2 */
  columns?: 1 | 2 | 3;
  className?: string;
}

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
} as const;

export function DescriptionList({
  items,
  columns = 2,
  className,
}: DescriptionListProps) {
  return (
    <dl className={`grid gap-4 ${gridCols[columns]} ${className ?? ""}`}>
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <dt className="text-xs font-medium text-muted-foreground">
            {item.label}
          </dt>
          <dd className="text-sm text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
