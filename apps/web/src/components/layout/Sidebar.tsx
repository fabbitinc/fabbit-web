import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  GitPullRequestArrow,
  Package,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderTree } from "@/features/items/components/FolderTree";
import { useUploadStore } from "@/stores/uploadStore";

const menuItems = [
  { id: "dashboard", label: "대시보드", icon: LayoutDashboard, path: "/" },
  { id: "projects", label: "프로젝트", icon: FolderKanban, path: "/projects" },
  {
    id: "changes",
    label: "변경 관리",
    icon: GitPullRequestArrow,
    path: "/changes",
  },
  { id: "parts", label: "부품 관리", icon: Package, path: "/parts" },
];

interface SidebarProps {
  isDesktop: boolean;
  collapsed: boolean;
  mobileOpen: boolean;
  width: number;
  showFolderTree: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  isDesktop,
  collapsed,
  mobileOpen,
  width,
  showFolderTree,
  onCloseMobile,
}: SidebarProps) {
  const location = useLocation();
  const files = useUploadStore((state) => state.files);
  const activeUploads = files.filter(
    (f) => f.status === "uploading" || f.status === "analyzing",
  );
  const hasActiveUploads = activeUploads.length > 0;
  const navWidth = Math.min(width, 320);
  const showAsOverlay = !isDesktop;
  const isVisible = isDesktop || mobileOpen;

  // 프로젝트 메뉴는 /projects 및 /projects/:id 등 하위 경로에서도 활성 상태
  const isMenuActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "sidebar-shell sidebar-divider z-40 flex h-full shrink-0 flex-col border-r transition-[width,transform] duration-200",
          showAsOverlay && "absolute left-0 top-0 shadow-2xl",
          !isVisible && "-translate-x-full",
        )}
        style={{
          width: isDesktop ? "100%" : navWidth,
          maxWidth: showAsOverlay ? "90vw" : undefined,
        }}
      >
        {!isDesktop && (
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
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          <ScrollArea className="min-h-0 flex-1">
            <nav
              className={cn(
                "flex flex-col gap-1 p-3",
                collapsed && "items-center",
              )}
            >
              {menuItems.map((item) => {
                const isActive = isMenuActive(item.path);
                const navItem = (
                  <NavLink
                    to={item.path}
                    onClick={onCloseMobile}
                    className={cn(
                      "sidebar-nav-item relative flex h-9 items-center rounded-lg px-4 transition-all",
                      collapsed
                        ? "w-9 justify-center px-0"
                        : "w-full justify-start gap-2.5",
                      isActive ? "sidebar-nav-item--active" : "",
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <span className="truncate text-sm font-medium">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
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
            </nav>

            {showFolderTree && !collapsed && (
              <div className="sidebar-divider mt-2 border-t p-3">
                <p
                  className="mb-2 text-xs font-medium"
                  style={{ color: "var(--nav-sidebar-icon)" }}
                >
                  프로젝트 트리
                </p>
                <div
                  className="overflow-hidden rounded-md border"
                  style={{ borderColor: "var(--nav-sidebar-border)" }}
                >
                  <FolderTree />
                </div>
              </div>
            )}
          </ScrollArea>

          {hasActiveUploads && (
            <div
              className={cn(
                "sidebar-divider border-t p-3",
                collapsed && "px-2",
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "sidebar-ai-indicator flex items-center rounded-lg",
                      collapsed
                        ? "h-10 w-10 justify-center"
                        : "gap-2 px-3 py-2",
                    )}
                  >
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      style={{ color: "var(--nav-sidebar-ai-icon)" }}
                    />
                    {!collapsed && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--nav-sidebar-text)" }}
                      >
                        {activeUploads.length}개 처리 중
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={8}
                  hideArrow
                  className="sidebar-tooltip"
                >
                  <p className="font-medium">
                    {activeUploads.length}개 파일 처리 중
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--nav-sidebar-ai-subtext)" }}
                  >
                    AI가 도면을 분석하고 있습니다
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
