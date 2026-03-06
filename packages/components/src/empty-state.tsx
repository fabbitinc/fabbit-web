import type { ComponentType, ReactNode } from "react";
import { Button } from "@fabbit/ui";

export interface EmptyStateProps {
  /** 상단 아이콘 */
  icon: ComponentType<{ className?: string }>;
  /** 제목 */
  title: string;
  /** 설명 */
  description: string;
  /** 액션 버튼 라벨. 생략 시 버튼 미표시 */
  actionLabel?: string;
  /** 액션 버튼 클릭 핸들러 */
  onAction?: () => void;
  /** 추가 콘텐츠 (버튼 하단) */
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 px-6 py-12 text-center ${className ?? ""}`}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <div>
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
}
