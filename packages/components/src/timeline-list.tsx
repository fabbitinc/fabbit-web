import type { ComponentType, ReactNode } from "react";
import { Badge } from "@fabbit/ui";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "accent";

export interface TimelineItem {
  /** 고유 키 */
  id: string;
  /** 이벤트 제목 (예: "작업지시 생성") */
  title: string;
  /** 이벤트 설명 */
  description?: string;
  /** 타임스탬프 (예: "2026-03-07 09:30") */
  timestamp: string;
  /** 상태 뱃지 텍스트 */
  badge?: string;
  /** 상태 뱃지 variant */
  badgeVariant?: BadgeVariant;
  /** 아이콘 (생략 시 도트 표시) */
  icon?: ComponentType<{ className?: string }>;
}

export interface TimelineListProps {
  items: TimelineItem[];
  /** 타임라인 하단에 추가 콘텐츠 */
  children?: ReactNode;
  className?: string;
}

export function TimelineList({ items, children, className }: TimelineListProps) {
  return (
    <div className={`relative space-y-0 ${className ?? ""}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;

        return (
          <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* 세로 라인 */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
            )}

            {/* 아이콘 또는 도트 */}
            <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
              {Icon ? (
                <Icon className="size-4 text-muted-foreground" />
              ) : (
                <div className="size-2 rounded-full bg-primary" />
              )}
            </div>

            {/* 콘텐츠 */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {item.title}
                </p>
                {item.badge && (
                  <Badge variant={item.badgeVariant ?? "secondary"}>
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground/70">
                {item.timestamp}
              </p>
            </div>
          </div>
        );
      })}
      {children}
    </div>
  );
}
