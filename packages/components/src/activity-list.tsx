import type { ComponentType, ReactNode } from "react";
import { Badge, UserAvatar } from "@fabbit/ui";
import { ChevronRight } from "lucide-react";

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

export interface ActivityItem {
  id: string;
  /** 좌측 아이콘 */
  icon: ComponentType<{ className?: string }>;
  /** 아이콘 색상 className (예: "text-emerald-500") */
  iconClassName?: string;
  /** 번호 (예: "#42") */
  number?: string;
  /** 제목 */
  title: string;
  /** 부제 (프로젝트명, 시간 등) */
  subtitle?: string;
  /** 라벨 */
  label?: { name: string; color: string };
  /** 상태 뱃지 */
  status?: { text: string; variant?: BadgeVariant };
  /** 작성자 이름 (아바타 표시) */
  author?: string;
  /** 클릭 핸들러 */
  onClick?: () => void;
}

export interface ActivityListProps {
  /** 섹션 제목 */
  title: string;
  items: ActivityItem[];
  /** 우측 상단 액션 (예: "전체 보기" 버튼) */
  action?: ReactNode;
  className?: string;
}

export function ActivityList({
  title,
  items,
  action,
  className,
}: ActivityListProps) {
  return (
    <section className={`rounded-lg border bg-card ${className ?? ""}`}>
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      <div className="divide-y">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              disabled={!item.onClick}
              className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-accent/40 disabled:cursor-default disabled:hover:bg-transparent"
            >
              <Icon className={`size-4 shrink-0 ${item.iconClassName ?? "text-muted-foreground"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {item.number && (
                    <span className="text-xs font-medium text-muted-foreground">{item.number}</span>
                  )}
                  <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
                </div>
                {item.subtitle && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
                )}
              </div>
              {item.label && (
                <span
                  className="hidden shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium sm:inline-flex"
                  style={{
                    color: item.label.color,
                    borderColor: `${item.label.color}33`,
                    backgroundColor: `${item.label.color}10`,
                  }}
                >
                  {item.label.name}
                </span>
              )}
              {item.status && (
                <Badge variant={item.status.variant ?? "outline"} className="shrink-0 text-[11px]">
                  {item.status.text}
                </Badge>
              )}
              {item.author && (
                <UserAvatar name={item.author} className="size-6" />
              )}
              {item.onClick && (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
