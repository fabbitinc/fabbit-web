import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DetailDrawer } from "./DetailDrawer";

interface MainLayoutProps {
  children: ReactNode;
}

const SIDENAV_WIDTH = 240;

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

  const closeMobileSideNav = useCallback(() => {
    setIsSideNavOverlayOpen(false);
  }, []);

  const topNavRow = showBanner ? 2 : 1;
  const contentRow = showBanner ? 3 : 2;
  const sideNavColumn = isDesktop ? `${isSideNavCollapsed ? 64 : SIDENAV_WIDTH}px` : "0px";

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

  return (
    <div
      className="relative grid h-screen overflow-hidden bg-background"
      style={{
        gridTemplateRows: `${showBanner ? "44px " : ""}48px minmax(0,1fr)`,
        gridTemplateColumns: `${sideNavColumn} minmax(0,1fr)`,
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
          width={SIDENAV_WIDTH}
          showFolderTree={showFolderTree}
          onCloseMobile={closeMobileSideNav}
        />
      </div>

      <main
        style={{ gridRow: contentRow, gridColumn: 2 }}
        className="relative z-0 min-h-0 overflow-auto p-6"
      >
        {children}
      </main>

      <DetailDrawer />
    </div>
  );
}
