import type { ComponentType } from "react";
import { Card, CardHeader, CardDescription, CardTitle, CardContent, Progress } from "@fabbit/ui";

export interface UsageCardProps {
  /** 아이콘 */
  icon: ComponentType<{ className?: string }>;
  /** 라벨 (예: "파일 저장 용량") */
  label: string;
  /** 사용량 (예: 8.2) */
  used: number;
  /** 한도 (예: 10) */
  limit: number;
  /** 단위 (예: "GB") */
  unit: string;
  /** 경고 임계값 (%). 기본값: 80 */
  warningThreshold?: number;
  className?: string;
}

export function UsageCard({
  icon: Icon,
  label,
  used,
  limit,
  unit,
  warningThreshold = 80,
  className,
}: UsageCardProps) {
  const percent = Math.round((used / limit) * 100);
  const isHigh = percent >= warningThreshold;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-3.5" />
          {label}
        </CardDescription>
        <CardTitle className="text-2xl tabular-nums">
          {used.toLocaleString()}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            / {limit.toLocaleString()} {unit}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={percent} />
        {isHigh && (
          <p className="text-xs text-destructive">
            사용량이 {percent}%에 도달했습니다
          </p>
        )}
      </CardContent>
    </Card>
  );
}
