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
  { id: "items", label: "부품관리", icon: Package, path: "/items" },
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
      <aside className="flex h-screen w-16 flex-col bg-[#0f172a]">
        <div className="flex h-14 items-center justify-center border-b border-[#1e293b]">
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
                      "relative flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                      isActive
                        ? "bg-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/25"
                        : "text-[#64748b] hover:bg-[#1e293b] hover:text-[#e2e8f0]"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#1e293b] text-white border-[#334155]">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Active Uploads Indicator */}
        {hasActiveUploads && (
          <div className="border-t border-[#1e293b] p-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8b5cf6]/20">
                  <Loader2 className="h-5 w-5 animate-spin text-[#8b5cf6]" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#1e293b] text-white border-[#334155]">
                <p className="font-medium">{activeUploads.length}개 파일 처리 중</p>
                <p className="text-xs text-[#94a3b8]">AI가 도면을 분석하고 있습니다</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
