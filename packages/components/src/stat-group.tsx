import type { ReactNode } from "react";

export interface StatGroupProps {
  /** KpiCard 등 통계 카드들 */
  children: ReactNode;
  /** 컬럼 수. 기본값: 4 */
  columns?: 2 | 3 | 4;
  className?: string;
}

const gridCols = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function StatGroup({
  children,
  columns = 4,
  className,
}: StatGroupProps) {
  return (
    <div className={`grid gap-4 ${gridCols[columns]} ${className ?? ""}`}>
      {children}
    </div>
  );
}
