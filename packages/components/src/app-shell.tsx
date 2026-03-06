import type { ReactNode } from "react";

export interface AppShellProps {
  /** 상단 헤더 (AppHeader) */
  header: ReactNode;
  /** 좌측 사이드바 (AppSidebar) */
  sidebar?: ReactNode;
  /** 사이드바 너비 (px). 기본값: 240 */
  sidebarWidth?: number;
  /** 사이드바 접힘 너비 (px). 기본값: 64 */
  sidebarCollapsedWidth?: number;
  /** 사이드바 접힘 여부 */
  sidebarCollapsed?: boolean;
  /** 상단 배너 슬롯 */
  banner?: ReactNode;
  /** 메인 콘텐츠 */
  children: ReactNode;
  className?: string;
}

export function AppShell({
  header,
  sidebar,
  sidebarWidth = 240,
  sidebarCollapsedWidth = 64,
  sidebarCollapsed = false,
  banner,
  children,
  className,
}: AppShellProps) {
  const sideCol = sidebar
    ? `${sidebarCollapsed ? sidebarCollapsedWidth : sidebarWidth}px`
    : "0px";

  return (
    <div
      className={`relative grid h-screen overflow-hidden bg-background ${className ?? ""}`}
      style={{
        gridTemplateRows: `${banner ? "auto " : ""}48px minmax(0,1fr)`,
        gridTemplateColumns: `${sideCol} minmax(0,1fr)`,
      }}
    >
      {/* 배너 */}
      {banner && (
        <div style={{ gridRow: 1, gridColumn: "1 / -1" }}>{banner}</div>
      )}

      {/* 헤더 */}
      <div style={{ gridRow: banner ? 2 : 1, gridColumn: "1 / -1" }}>
        {header}
      </div>

      {/* 사이드바 */}
      {sidebar && (
        <div
          style={{ gridRow: banner ? 3 : 2, gridColumn: 1 }}
          className="min-h-0 overflow-hidden"
        >
          {sidebar}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main
        style={{ gridRow: banner ? 3 : 2, gridColumn: sidebar ? 2 : "1 / -1" }}
        className="relative z-0 min-h-0 overflow-auto"
      >
        {children}
      </main>
    </div>
  );
}
