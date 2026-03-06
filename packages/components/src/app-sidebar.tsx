import type { ComponentType, ReactNode } from "react";
import { Button, ScrollArea, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@fabbit/ui";
import { X } from "lucide-react";

export interface AppSidebarNavItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  onClick: () => void;
}

export interface AppSidebarSection {
  id: string;
  label?: string;
  items: AppSidebarNavItem[];
}

export interface AppSidebarProps {
  /** 네비게이션 섹션들 */
  sections: AppSidebarSection[];
  /** 접힘 여부 (데스크톱) */
  collapsed?: boolean;
  /** 모바일 오버레이 표시 여부 */
  mobileOpen?: boolean;
  /** 사이드바 너비 (px). 기본값: 240 */
  width?: number;
  /** 모바일 닫기 콜백 */
  onCloseMobile?: () => void;
  /** 하단 슬롯 (설정, 상태 표시 등) */
  footer?: ReactNode;
  className?: string;
}

export function AppSidebar({
  sections,
  collapsed = false,
  mobileOpen = false,
  width = 240,
  onCloseMobile,
  footer,
  className,
}: AppSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`flex h-full shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width,transform] duration-200 ${
          mobileOpen ? "absolute left-0 top-0 z-40 shadow-2xl" : ""
        } ${className ?? ""}`}
        style={{ width: collapsed ? 64 : width }}
      >
        {/* 모바일 닫기 버튼 */}
        {mobileOpen && onCloseMobile && (
          <div className="flex h-10 shrink-0 items-center justify-end border-b px-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onCloseMobile}
              aria-label="사이드바 닫기"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        <ScrollArea className="min-h-0 flex-1">
          <nav className={`flex flex-col gap-1 p-3 ${collapsed ? "items-center" : ""}`}>
            {sections.map((section) => (
              <div key={section.id} className="space-y-1">
                {section.label && !collapsed && (
                  <p className="mb-1 px-3 text-xs font-medium text-muted-foreground">
                    {section.label}
                  </p>
                )}
                {section.items.map((item) => {
                  const navButton = (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      className={`flex h-9 items-center rounded-lg transition-colors ${
                        collapsed
                          ? "w-9 justify-center"
                          : "w-full justify-start gap-2.5 px-3"
                      } ${
                        item.active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}
                    >
                      <item.icon className="size-5 shrink-0" />
                      {!collapsed && (
                        <span className="truncate text-sm">{item.label}</span>
                      )}
                    </button>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.id}>{navButton}</div>;
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {footer && (
          <div className={`border-t p-3 ${collapsed ? "px-2" : ""}`}>
            {footer}
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
