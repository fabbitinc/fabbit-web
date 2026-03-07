import type { ComponentType, ReactNode } from "react";
import {
  Button,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from "@fabbit/ui";
import { Loader2, X } from "lucide-react";

export interface AppSidebarNavItem {
  active?: boolean;
  icon: ComponentType<{ className?: string }>;
  id: string;
  label: string;
  onClick: () => void;
}

export interface AppSidebarSection {
  id: string;
  items: AppSidebarNavItem[];
  label?: string;
}

export interface AppSidebarTreeSection {
  content: ReactNode;
  title: string;
}

export interface AppSidebarStatusIndicator {
  count: number;
  tooltipDescription?: string;
  tooltipTitle?: string;
}

export interface AppSidebarProps {
  className?: string;
  collapsed?: boolean;
  isDesktop?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  sections: AppSidebarSection[];
  statusIndicator?: AppSidebarStatusIndicator | null;
  treeSection?: AppSidebarTreeSection | null;
  width?: number;
}

export function AppSidebar({
  className,
  collapsed = false,
  isDesktop = true,
  mobileOpen = false,
  onCloseMobile,
  sections,
  statusIndicator,
  treeSection,
  width = 240,
}: AppSidebarProps) {
  const navWidth = Math.min(width, 320);
  const showAsOverlay = !isDesktop;
  const isVisible = isDesktop || mobileOpen;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "sidebar-shell sidebar-divider z-40 flex h-full shrink-0 flex-col border-r transition-[width,transform] duration-200",
          showAsOverlay && "absolute left-0 top-0 shadow-2xl",
          !isVisible && "-translate-x-full",
          className,
        )}
        style={{
          width: isDesktop ? "100%" : navWidth,
          maxWidth: showAsOverlay ? "90vw" : undefined,
        }}
      >
        {!isDesktop && onCloseMobile ? (
          <div className="sidebar-divider flex h-10 shrink-0 items-center justify-end border-b px-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              style={{ color: "var(--nav-sidebar-icon)" }}
              onClick={onCloseMobile}
              aria-label="사이드 내비게이션 닫기"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col">
          <ScrollArea className="min-h-0 flex-1">
            <nav className={cn("flex flex-col gap-1 p-3", collapsed && "items-center")}>
              {sections.map((section) => (
                <div key={section.id} className="space-y-1">
                  {section.label && !collapsed ? (
                    <p
                      className="mb-1 px-3 text-xs font-medium"
                      style={{ color: "var(--nav-sidebar-icon)" }}
                    >
                      {section.label}
                    </p>
                  ) : null}
                  {section.items.map((item) => {
                    const navItem = (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          item.onClick();
                          if (!isDesktop) {
                            onCloseMobile?.();
                          }
                        }}
                        className={cn(
                          "sidebar-nav-item relative flex h-9 items-center rounded-lg px-4 transition-all",
                          collapsed ? "w-9 justify-center px-0" : "w-full justify-start gap-2.5",
                          item.active ? "sidebar-nav-item--active" : "",
                        )}
                        style={
                          item.active
                            ? {
                                backgroundColor: "var(--nav-sidebar-active-bg)",
                                color: "var(--nav-sidebar-active-text)",
                                boxShadow: "none",
                              }
                            : { color: "var(--nav-sidebar-text)" }
                        }
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed ? (
                          <span className="truncate text-sm font-medium">{item.label}</span>
                        ) : null}
                      </button>
                    );

                    if (collapsed) {
                      return (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            sideOffset={8}
                            hideArrow
                            className="sidebar-tooltip"
                          >
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <div key={item.id}>{navItem}</div>;
                  })}
                </div>
              ))}
            </nav>

            {treeSection && !collapsed ? (
              <div className="sidebar-divider mt-2 border-t p-3">
                <p
                  className="mb-2 text-xs font-medium"
                  style={{ color: "var(--nav-sidebar-icon)" }}
                >
                  {treeSection.title}
                </p>
                <div
                  className="overflow-hidden rounded-md border"
                  style={{ borderColor: "var(--nav-sidebar-border)" }}
                >
                  {treeSection.content}
                </div>
              </div>
            ) : null}
          </ScrollArea>

          {statusIndicator ? (
            <div className={cn("sidebar-divider border-t p-3", collapsed && "px-2")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "sidebar-ai-indicator flex items-center rounded-lg",
                      collapsed ? "h-10 w-10 justify-center" : "gap-2 px-3 py-2",
                    )}
                  >
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      style={{ color: "var(--nav-sidebar-ai-icon)" }}
                    />
                    {!collapsed ? (
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--nav-sidebar-text)" }}
                      >
                        {statusIndicator.count}개 처리 중
                      </span>
                    ) : null}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={8}
                  hideArrow
                  className="sidebar-tooltip"
                >
                  <p className="font-medium">
                    {statusIndicator.tooltipTitle ?? `${statusIndicator.count}개 파일 처리 중`}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--nav-sidebar-ai-subtext)" }}
                  >
                    {statusIndicator.tooltipDescription ?? "AI가 도면을 분석하고 있습니다"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : null}
        </div>
      </aside>
    </TooltipProvider>
  );
}
