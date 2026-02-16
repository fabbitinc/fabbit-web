import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  ClipboardCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUploadStore } from "@/stores/uploadStore";

const menuItems = [
  { id: "dashboard", label: "대시보드", icon: LayoutDashboard, path: "/" },
  { id: "projects", label: "프로젝트", icon: FolderKanban, path: "/projects" },
  { id: "parts", label: "부품관리", icon: Package, path: "/parts" },
  { id: "approval", label: "결재", icon: ClipboardCheck, path: "/approval" },
  { id: "conflicts", label: "충돌관리", icon: AlertTriangle, path: "/conflicts" },
];

export function Sidebar() {
  const location = useLocation();
  const files = useUploadStore((state) => state.files);
  const activeUploads = files.filter(
    (f) => f.status === "uploading" || f.status === "analyzing"
  );
  const hasActiveUploads = activeUploads.length > 0;

  // 프로젝트 메뉴는 /projects 및 /projects/:id 등 하위 경로에서도 활성 상태
  const isMenuActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="sidebar-shell flex h-screen w-16 flex-col">
        <div className="sidebar-divider flex h-14 items-center justify-center border-b">
          <span className="text-xl font-bold text-white">F</span>
        </div>
        <nav className="flex flex-1 flex-col items-center gap-2 py-4">
          {menuItems.map((item) => {
            const isActive = isMenuActive(item.path);
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={cn(
                      "sidebar-nav-item relative flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                      isActive
                        ? "sidebar-nav-item--active"
                        : ""
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="sidebar-tooltip">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Active Uploads Indicator */}
        {hasActiveUploads && (
          <div className="sidebar-divider border-t p-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="sidebar-ai-indicator flex h-10 w-10 items-center justify-center rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--nav-sidebar-ai-icon)" }} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="sidebar-tooltip">
                <p className="font-medium">{activeUploads.length}개 파일 처리 중</p>
                <p className="text-xs" style={{ color: "var(--nav-sidebar-ai-subtext)" }}>AI가 도면을 분석하고 있습니다</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
