import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Progress,
} from "@fabbit/ui";

type StatusVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "danger" | "info" | "neutral" | "accent";

export interface StatusCardProps {
  /** 장비/항목 이름 (예: "CNC-001") */
  name: string;
  /** 상태 텍스트 (예: "가동", "정비중") */
  status: string;
  /** Badge variant */
  statusVariant?: StatusVariant;
  /** 진행률 (0-100). 생략 시 Progress 바 미표시 */
  progress?: number;
  /** Progress 라벨. 기본값: "진행률" */
  progressLabel?: string;
  /** 카드 하단에 표시할 추가 정보 */
  children?: ReactNode;
  className?: string;
}

export function StatusCard({
  name,
  status,
  statusVariant = "default",
  progress,
  progressLabel = "진행률",
  children,
  className,
}: StatusCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{name}</CardTitle>
          <Badge variant={statusVariant}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {progress != null && (
          <>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progressLabel}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
