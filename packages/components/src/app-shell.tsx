import type { ReactNode } from "react";
import { cn } from "@fabbit/ui";

export interface AppShellProps {
  banner?: ReactNode;
  children: ReactNode;
  className?: string;
  drawer?: ReactNode;
  header: ReactNode;
  isDesktop?: boolean;
  isSidebarCollapsed?: boolean;
  isSidebarOverlayOpen?: boolean;
  mainClassName?: string;
  onCloseSidebarOverlay?: () => void;
  onCloseMobileSidebar?: () => void;
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  sidebarCollapsedWidth?: number;
  sidebarWidth?: number;
}

export function AppShell({
  banner,
  children,
  className,
  drawer,
  header,
  isDesktop = true,
  isSidebarCollapsed = false,
  isSidebarOverlayOpen = false,
  mainClassName,
  onCloseSidebarOverlay,
  onCloseMobileSidebar,
  sidebar,
  sidebarCollapsed,
  sidebarCollapsedWidth = 64,
  sidebarWidth = 240,
}: AppShellProps) {
  const topNavRow = banner ? 2 : 1;
  const contentRow = banner ? 3 : 2;
  const collapsed = sidebarCollapsed ?? isSidebarCollapsed;
  const sideColumn = isDesktop
    ? sidebar
      ? `${collapsed ? sidebarCollapsedWidth : sidebarWidth}px`
      : "0px"
    : "0px";
  const closeSidebarOverlay = onCloseMobileSidebar ?? onCloseSidebarOverlay;

  return (
    <div
      className={cn("relative grid h-screen overflow-hidden bg-background", className)}
      style={{
        gridTemplateRows: `${banner ? "44px " : ""}48px minmax(0,1fr)`,
        gridTemplateColumns: `${sideColumn} minmax(0,1fr)`,
      }}
    >
      {banner ? (
        <div style={{ gridColumn: "1 / -1", gridRow: 1 }}>{banner}</div>
      ) : null}

      <div style={{ gridColumn: "1 / -1", gridRow: topNavRow }}>{header}</div>

      {!isDesktop && isSidebarOverlayOpen ? (
        <button
          type="button"
          className="absolute inset-0 z-30 bg-slate-900/30"
          aria-label="사이드 내비게이션 닫기"
          onClick={closeSidebarOverlay}
        />
      ) : null}

      {sidebar ? (
        <div
          style={{ gridColumn: 1, gridRow: contentRow }}
          className="min-h-0 overflow-hidden"
        >
          {sidebar}
        </div>
      ) : null}

      <main
        style={{ gridColumn: sidebar ? 2 : "1 / -1", gridRow: contentRow }}
        className={cn("relative z-0 min-h-0 overflow-auto p-6", mainClassName)}
      >
        {children}
      </main>

      {drawer}
    </div>
  );
}
