import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  Badge,
} from "@fabbit/ui";

export interface KpiCardProps {
  /** KPI 라벨 (예: "가동률", "불량률") */
  label: string;
  /** KPI 값 (예: "94.2%", "1,200") */
  value: string;
  /** 변화량 (예: "+2.1%", "-0.4%") */
  change?: string;
  /** 변화 방향: 양수면 true, 음수면 false */
  changePositive?: boolean;
  /** 값 우측 또는 하단에 표시할 추가 요소 */
  extra?: ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  value,
  change,
  changePositive,
  extra,
  className,
}: KpiCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        {change != null && (
          <Badge variant={changePositive ? "success" : "danger"}>
            {change}
          </Badge>
        )}
        {extra}
      </CardContent>
    </Card>
  );
}
