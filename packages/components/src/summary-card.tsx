import type { ComponentType } from "react";
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from "@fabbit/ui";

export interface SummaryCardProps {
  /** 아이콘 */
  icon: ComponentType<{ className?: string }>;
  /** 라벨 (예: "할당된 이슈") */
  label: string;
  /** 값 (예: "3건") */
  value: string;
  /** 부제 (예: "열린 이슈") */
  sub?: string;
  /** 클릭 핸들러. 생략 시 클릭 불가 */
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
  return (
    <Card
      className={`${onClick ? "cursor-pointer transition-colors hover:bg-accent/40" : ""} ${className ?? ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-3.5" />
          {label}
        </CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {sub && (
        <CardContent>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </CardContent>
      )}
    </Card>
  );
}
