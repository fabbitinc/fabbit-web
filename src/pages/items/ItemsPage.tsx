import { useNavigate } from "react-router-dom";
import { ChevronRight, Upload } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ItemTree } from "@/features/items/components/ItemTree";
import { ProjectHomeView } from "@/features/projects/components/ProjectHomeView";
import { useItemStore } from "@/stores/itemStore";
import { useUploadStore } from "@/stores/uploadStore";
import { mockFolders } from "@/features/items/mock-data";
import type { TreeNodeData } from "@/features/items/types";
import { cn } from "@/lib/utils";

function findNodePath(
  nodes: TreeNodeData[],
  targetId: string,
  path: TreeNodeData[] = []
): TreeNodeData[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [...path, node];
    }
    if (node.children) {
      const result = findNodePath(node.children, targetId, [
        ...path,
        node,
      ]);
      if (result) return result;
    }
  }
  return null;
}


export function ItemsPage() {
  const navigate = useNavigate();
  const selectedFolderId = useItemStore((state) => state.selectedFolderId);
  const selectedProjectId = useItemStore((state) => state.selectedProjectId);
  const setSelectedFolderId = useItemStore((state) => state.setSelectedFolderId);
  const setSelectedProjectId = useItemStore((state) => state.setSelectedProjectId);
  const openUploadModal = useUploadStore((state) => state.openModal);

  const breadcrumbPath = findNodePath(mockFolders, selectedFolderId) ?? [];

  // 브레드크럼 클릭 핸들러
  const handleBreadcrumbClick = (node: TreeNodeData | null) => {
    if (!node) {
      // "모든 아이템" 클릭 - 루트로 이동
      setSelectedFolderId("");
      setSelectedProjectId(null);
    } else if (node.type === "project") {
      // 프로젝트 → 프로젝트 홈
      setSelectedFolderId("");
      setSelectedProjectId(node.id);
    } else if (node.type === "item") {
      // 어셈블리 → 상세 페이지로 바로 이동
      setSelectedFolderId("");
      setSelectedProjectId(null);
      navigate(`/items/${node.id}`);
    } else {
      // 폴더 → 폴더 목록
      setSelectedFolderId(node.id);
      setSelectedProjectId(null);
    }
  };

  // 프로젝트가 선택되면 ProjectHomeView 표시
  if (selectedProjectId) {
    return <ProjectHomeView projectId={selectedProjectId} />;
  }

  // 일반 아이템 목록
  return (
    <div className="flex h-full flex-col">
      {/* Header with Breadcrumb and Upload Button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm">
          <button
            className="text-[#94a3b8] transition-colors hover:text-[#64748b]"
            onClick={() => handleBreadcrumbClick(null)}
          >
            모든 아이템
          </button>
          {breadcrumbPath.map((node, index) => {
            const isLast = index === breadcrumbPath.length - 1;
            return (
              <span key={node.id} className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4 text-[#cbd5e1]" />
                <button
                  className={cn(
                    "transition-colors",
                    isLast
                      ? "font-medium text-[#0f172a]"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  )}
                  onClick={() => handleBreadcrumbClick(node)}
                  disabled={isLast}
                >
                  {node.name}
                </button>
              </span>
            );
          })}
        </div>

        <Button
          onClick={openUploadModal}
          className="bg-[#3b82f6] hover:bg-[#2563eb]"
        >
          <Upload className="mr-2 h-4 w-4" />
          도면/BOM 업로드
        </Button>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
        <ScrollArea className="h-full">
          <ItemTree />
        </ScrollArea>
      </div>
    </div>
  );
}
