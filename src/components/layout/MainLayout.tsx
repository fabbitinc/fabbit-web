import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { GripVertical } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DetailDrawer } from "./DetailDrawer";
import { FolderTree } from "@/features/items/components/FolderTree";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

const MIN_TREE_WIDTH = 240;
const MAX_TREE_WIDTH = 400;
const DEFAULT_TREE_WIDTH = 224; // 14rem = 224px

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const isItemsPage = location.pathname === "/items";
  const isItemDetailPage = location.pathname.startsWith("/items/");

  // FolderTree를 보여줄 페이지들 (부품관리, 아이템 상세만 - 프로젝트 상세는 제외)
  const showFolderTree = isItemsPage || isItemDetailPage;

  // 트리 너비 상태 (localStorage에서 복원)
  const [treeWidth, setTreeWidth] = useState(() => {
    const saved = localStorage.getItem("fabbit-tree-width");
    return saved ? parseInt(saved, 10) : DEFAULT_TREE_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  // 리사이즈 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    // 사이드바 너비(64px)를 빼고 계산
    const newWidth = e.clientX - 64;
    const clampedWidth = Math.min(Math.max(newWidth, MIN_TREE_WIDTH), MAX_TREE_WIDTH);
    setTreeWidth(clampedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      localStorage.setItem("fabbit-tree-width", treeWidth.toString());
    }
  }, [isResizing, treeWidth]);

  // 마우스 이벤트 리스너
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

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />

      {showFolderTree && (
        <>
          {/* Tree Panel */}
          <div
            className="sidebar-shell sidebar-divider relative border-r"
            style={{ width: treeWidth }}
          >
            <ScrollArea className="h-full">
              <FolderTree />
            </ScrollArea>
          </div>

          {/* Resize Handle */}
          <div
            className="sidebar-resizer-track group relative flex w-1 cursor-col-resize items-center justify-center"
            onMouseDown={handleMouseDown}
          >
            {/* 드래그 핸들 버튼 - 항상 보임 */}
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
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      <DetailDrawer />
    </div>
  );
}
