import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DetailDrawer } from "./DetailDrawer";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

const MIN_SIDENAV_WIDTH = 240;
const DEFAULT_SIDENAV_WIDTH = 320;

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const isItemsPage = location.pathname === "/items";
  const isItemDetailPage = location.pathname.startsWith("/items/");

  // FolderTree를 보여줄 페이지들 (부품관리, 아이템 상세만 - 프로젝트 상세는 제외)
  const showFolderTree = isItemsPage || isItemDetailPage;

  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [showBanner, setShowBanner] = useState(false);
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(() => {
    const saved = localStorage.getItem("fabbit-side-nav-collapsed");
    return saved === "true";
  });
  const [isSideNavOverlayOpen, setIsSideNavOverlayOpen] = useState(false);
  const [sideNavWidth, setSideNavWidth] = useState(() => {
    const saved = localStorage.getItem("fabbit-side-nav-width");
    return saved ? parseInt(saved, 10) : DEFAULT_SIDENAV_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDesktop || isSideNavCollapsed) return;
    e.preventDefault();
    setIsResizing(true);
  }, [isDesktop, isSideNavCollapsed]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const maxWidth = Math.floor(window.innerWidth * 0.5);
    const clampedWidth = Math.min(Math.max(e.clientX, MIN_SIDENAV_WIDTH), maxWidth);
    setSideNavWidth(clampedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      localStorage.setItem("fabbit-side-nav-width", sideNavWidth.toString());
    }
  }, [isResizing, sideNavWidth]);

  const handleToggleSideNav = useCallback(() => {
    if (isDesktop) {
      setIsSideNavCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem("fabbit-side-nav-collapsed", next ? "true" : "false");
        return next;
      });
      return;
    }

    setIsSideNavOverlayOpen((prev) => !prev);
  }, [isDesktop]);

  const handleResizeDoubleClick = useCallback(() => {
    setIsSideNavCollapsed(true);
    localStorage.setItem("fabbit-side-nav-collapsed", "true");
  }, []);

  const closeMobileSideNav = useCallback(() => {
    setIsSideNavOverlayOpen(false);
  }, []);

  const topNavRow = showBanner ? 2 : 1;
  const contentRow = showBanner ? 3 : 2;
  const sideNavColumn = isDesktop ? `${isSideNavCollapsed ? 64 : sideNavWidth}px` : "0px";
  const splitterColumn = isDesktop && !isSideNavCollapsed ? "4px" : "0px";

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setIsSideNavOverlayOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop && !isSideNavCollapsed) {
      localStorage.setItem("fabbit-side-nav-width", sideNavWidth.toString());
    }
  }, [isDesktop, isSideNavCollapsed, sideNavWidth]);

  return (
    <div
      className="relative grid h-screen overflow-hidden bg-background"
      style={{
        gridTemplateRows: `${showBanner ? "44px " : ""}48px minmax(0,1fr)`,
        gridTemplateColumns: `${sideNavColumn} ${splitterColumn} minmax(0,1fr)`,
      }}
    >
      {showBanner && (
        <div className="flex items-center justify-between border-b border-blue-200 bg-blue-50 px-4" style={{ gridRow: 1, gridColumn: "1 / -1" }}>
          <p className="truncate text-sm text-blue-900">
            임시 배너입니다. 공지/안내 용도로 사용하고 나중에 삭제할 수 있습니다.
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-700 hover:bg-blue-100"
            onClick={() => setShowBanner(false)}
            aria-label="배너 닫기"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div style={{ gridRow: topNavRow, gridColumn: "1 / -1" }}>
        <Header onToggleSideNav={handleToggleSideNav} />
      </div>

      {!isDesktop && isSideNavOverlayOpen && (
        <button
          className="absolute inset-0 z-30 bg-slate-900/30"
          onClick={closeMobileSideNav}
          aria-label="사이드 내비게이션 닫기"
        />
      )}

      <div style={{ gridRow: contentRow, gridColumn: 1 }} className="min-h-0 overflow-hidden">
        <Sidebar
          isDesktop={isDesktop}
          collapsed={isDesktop ? isSideNavCollapsed : false}
          mobileOpen={isSideNavOverlayOpen}
          width={sideNavWidth}
          showFolderTree={showFolderTree}
          onCloseMobile={closeMobileSideNav}
        />
      </div>

      {isDesktop && !isSideNavCollapsed && (
        <div
          style={{ gridRow: contentRow, gridColumn: 2 }}
          className="sidebar-resizer-track group relative z-10 flex cursor-col-resize items-center justify-center"
          onMouseDown={handleMouseDown}
          onDoubleClick={handleResizeDoubleClick}
        >
          <div className={cn(
            "sidebar-resizer-handle absolute z-10 flex h-16 w-5 cursor-col-resize items-center justify-center rounded-full border shadow-lg transition-all",
            "hover:w-6",
            isResizing && "sidebar-resizer-handle--active w-6"
          )}>
            <GripVertical className={cn(
              "sidebar-resizer-icon h-5 w-5 transition-colors",
              isResizing && "text-white"
            )} />
          </div>
        </div>
      )}

      <main
        style={{ gridRow: contentRow, gridColumn: 3 }}
        className="relative z-0 min-h-0 overflow-auto p-6"
      >
        {children}
      </main>

      <DetailDrawer />
    </div>
  );
}
