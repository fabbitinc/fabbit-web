import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Folder, FolderOpen, Plus, Layers, Search, X, Box, Cog, Loader2, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useItemStore } from "@/stores/itemStore";
import { useBomImportStore } from "@/stores/bomImportStore";
import { useProjectTree } from "@/api";
import type { TreeNodeData } from "../types";

// TODO: 검색 기능 개선 - es-hangul의 getChoseong으로 초성 검색 지원
// import { getChoseong } from 'es-hangul';
// matchesSearch("브라켓 A", "ㅂㄹㅋ") → true

// 폴더 구조만 필터링 (프로젝트 > 폴더 > 아이템 1depth)
// 아이템의 하위(BOM)는 트리에서 숨김 → 상세 페이지에서 확인
function filterContainerNodes(nodes: TreeNodeData[]): TreeNodeData[] {
  return nodes.map((node) => ({
    ...node,
    // 아이템은 leaf 노드로 처리 (하위 BOM은 상세에서 확인)
    children:
      node.type === "item"
        ? undefined
        : node.children
          ? filterContainerNodes(node.children)
          : undefined,
  }));
}

// 검색어로 노드 필터링
function filterNodesBySearch(nodes: TreeNodeData[], searchTerm: string): TreeNodeData[] {
  if (!searchTerm.trim()) return nodes;

  const term = searchTerm.toLowerCase();

  return nodes.reduce<TreeNodeData[]>((acc, node) => {
    const nameMatch = node.name.toLowerCase().includes(term);
    const filteredChildren = node.children ? filterNodesBySearch(node.children, searchTerm) : [];

    // 이름이 매치되거나 자식 중 매치되는 것이 있으면 포함
    if (nameMatch || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }

    return acc;
  }, []);
}

// 특정 노드까지의 경로에 있는 모든 노드 ID 찾기
function findPathToNode(nodes: TreeNodeData[], targetId: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [...path, node.id];
    }
    if (node.children) {
      const result = findPathToNode(node.children, targetId, [...path, node.id]);
      if (result) return result;
    }
  }
  return null;
}

export function FolderTree() {
  const navigate = useNavigate();
  const location = useLocation();
  const openBomImportModal = useBomImportStore((state) => state.openModal);

  // API에서 트리 데이터 가져오기
  const { data: treeData, isLoading, error } = useProjectTree();

  // URL에서 프로젝트 ID 추출
  const projectMatch = location.pathname.match(/^\/projects\/(.+?)(?:\/|$)/);
  const urlProjectId = projectMatch ? projectMatch[1] : undefined;

  // URL에서 아이템 ID 추출 (/items/:id)
  const itemMatch = location.pathname.match(/^\/items\/(.+?)(?:\/|$)/);
  const urlItemId = itemMatch ? itemMatch[1] : undefined;

  const [searchTerm, setSearchTerm] = useState("");
  // 초기에 프로젝트(최상위)는 모두 펼침
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set<string>());
  const [newNodeDialog, setNewNodeDialog] = useState<{
    open: boolean;
    parentId: string | null;
    parentName: string;
    nodeType: "project" | "folder" | "item";
  }>({ open: false, parentId: null, parentName: "", nodeType: "folder" });
  const [newNodeName, setNewNodeName] = useState("");

  // treeData가 로드되면 프로젝트 노드 자동 펼침
  useEffect(() => {
    if (treeData) {
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        treeData.forEach((node) => {
          if (node.type === "project") {
            next.add(node.id);
          }
        });
        return next;
      });
    }
  }, [treeData]);

  // 컨테이너 노드만 필터링 (프로젝트, 폴더, 어셈블리)
  const structureNodes = useMemo(() => filterContainerNodes(treeData ?? []), [treeData]);

  // 검색어로 필터링
  const displayNodes = useMemo(
    () => (searchTerm ? filterNodesBySearch(structureNodes, searchTerm) : structureNodes),
    [structureNodes, searchTerm]
  );

  // 선택된 폴더/프로젝트가 변경되면 해당 경로 자동 펼침
  const { selectedFolderId, selectedProjectId: storeProjectId } = useItemStore();

  useEffect(() => {
    // URL의 아이템 ID를 우선, 그 다음 store의 폴더/프로젝트 ID
    const targetId = urlItemId || selectedFolderId || storeProjectId;
    if (targetId) {
      const path = findPathToNode(structureNodes, targetId);
      if (path) {
        setExpandedNodes((prev) => {
          // 이미 모든 경로가 확장되어 있으면 상태 변경 안 함
          const allExpanded = path.every((id) => prev.has(id));
          if (allExpanded) return prev; // 같은 참조 반환 → 리렌더링 없음
          return new Set([...prev, ...path]);
        });
      }
    }
  }, [urlItemId, selectedFolderId, storeProjectId, structureNodes]);

  // 검색 시 모든 노드 펼침
  useEffect(() => {
    if (searchTerm) {
      const allNodeIds = new Set<string>();
      const collectIds = (nodes: TreeNodeData[]) => {
        nodes.forEach((node) => {
          allNodeIds.add(node.id);
          if (node.children) collectIds(node.children);
        });
      };
      collectIds(displayNodes);
      setExpandedNodes(allNodeIds);
    }
  }, [searchTerm, displayNodes]);

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleCreateNode = () => {
    if (newNodeName.trim()) {
      console.log(`Creating ${newNodeDialog.nodeType} "${newNodeName}" under ${newNodeDialog.parentId}`);
      setNewNodeDialog({ open: false, parentId: null, parentName: "", nodeType: "folder" });
      setNewNodeName("");
    }
  };

  const openNewNodeDialog = (parentId: string, parentName: string, nodeType: "project" | "folder" | "item" = "folder") => {
    setNewNodeDialog({ open: true, parentId, parentName, nodeType });
    setNewNodeName("");
  };

  const handleNodeClick = (node: TreeNodeData) => {
    if (node.type === "project") {
      // 부품관리에서 프로젝트 클릭 시 요약 패널 표시
      // 다른 페이지에서 클릭한 경우에만 /items로 이동
      if (location.pathname !== "/items") {
        navigate("/items");
      }
    }
  };

  const getDialogTitle = () => {
    switch (newNodeDialog.nodeType) {
      case "project": return "새 프로젝트 생성";
      case "folder": return "새 폴더 생성";
      case "item": return "새 아이템 생성";
    }
  };

  const getDialogPlaceholder = () => {
    switch (newNodeDialog.nodeType) {
      case "project": return "프로젝트 이름";
      case "folder": return "폴더 이름";
      case "item": return "아이템 이름";
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--brand-500)" }} />
        <p className="mt-2 text-xs" style={{ color: "var(--nav-sidebar-icon)" }}>프로젝트 로딩 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <p className="text-xs text-red-400">데이터를 불러오지 못했습니다</p>
        <p className="mt-1 text-[10px]" style={{ color: "var(--nav-sidebar-icon)" }}>{error.message}</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col">
        {/* 검색 바 */}
        <div className="p-3 pb-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--nav-sidebar-icon)" }} />
            <input
              type="text"
              placeholder="프로젝트/폴더 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sidebar-tree-search w-full rounded-md border py-1.5 pl-8 pr-8 text-xs outline-none transition-colors focus:ring-1"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="sidebar-tree-action absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 트리 헤더 */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--nav-sidebar-icon)" }}>
            Projects
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="sidebar-tree-action flex h-5 w-5 items-center justify-center rounded transition-colors"
                onClick={() => openNewNodeDialog("root", "루트", "project")}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} hideArrow className="sidebar-tooltip">
              새 프로젝트
            </TooltipContent>
          </Tooltip>
        </div>

        {/* 트리 목록 */}
        <div className="flex-1 overflow-auto px-3 pb-3">
          {displayNodes.length > 0 ? (
            <div className="space-y-0.5">
              {displayNodes.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  level={0}
                  projectId={node.id}
                  searchTerm={searchTerm}
                  onAddNode={openNewNodeDialog}
                  onNodeClick={handleNodeClick}
                  onBomImport={openBomImportModal}
                  urlProjectId={urlProjectId}
                  urlItemId={urlItemId}
                  expandedNodes={expandedNodes}
                  onToggleExpand={toggleExpanded}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-8 w-8" style={{ color: "var(--nav-sidebar-border)" }} />
              <p className="mt-2 text-xs" style={{ color: "var(--nav-sidebar-icon)" }}>검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* New Node Dialog */}
      <Dialog
        open={newNodeDialog.open}
        onOpenChange={(open) => setNewNodeDialog({ ...newNodeDialog, open })}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-3 text-sm text-muted-foreground">
              {newNodeDialog.parentId === "root" ? (
                <>새 {newNodeDialog.nodeType === "project" ? "프로젝트" : "폴더"}를 생성합니다.</>
              ) : (
                <>
                  <span className="font-medium text-foreground">{newNodeDialog.parentName}</span>
                  {" "}하위에 생성합니다.
                </>
              )}
            </p>
            <Input
              placeholder={getDialogPlaceholder()}
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateNode()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewNodeDialog({ open: false, parentId: null, parentName: "", nodeType: "folder" })}
            >
              취소
            </Button>
            <Button
              onClick={handleCreateNode}
              disabled={!newNodeName.trim()}
              style={{ backgroundColor: "var(--brand-500)" }}
            >
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

interface TreeNodeProps {
  node: TreeNodeData;
  level: number;
  projectId: string; // 이 노드가 속한 프로젝트 ID
  searchTerm: string; // 검색어 (하이라이트용)
  onAddNode: (parentId: string, parentName: string, nodeType?: "project" | "folder" | "item") => void;
  onNodeClick: (node: TreeNodeData) => void;
  onBomImport: (projectId: string, folderId: string) => void;
  urlProjectId?: string;
  urlItemId?: string;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
}

// 검색어 하이라이트 컴포넌트
function HighlightedText({ text, searchTerm }: { text: string; searchTerm: string }) {
  if (!searchTerm.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-400/30 text-inherit rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function TreeNode({ node, level, projectId, searchTerm, onAddNode, onNodeClick, onBomImport, urlProjectId, urlItemId, expandedNodes, onToggleExpand }: TreeNodeProps) {
  const navigate = useNavigate();
  const expanded = expandedNodes.has(node.id);
  const { selectedFolderId, selectedProjectId: storeProjectId, selectFolder, selectProject, clearSelection } = useItemStore();
  // 구조 노드만 표시하므로 children에서 item 타입은 제외됨
  const hasChildren = node.children && node.children.length > 0;

  // 선택 상태 결정
  // - URL의 아이템 ID (/items/:id)
  // - URL의 프로젝트 ID (/projects/:id)
  // - store의 폴더/프로젝트 ID (부품관리에서 선택)
  const isSelected = (() => {
    switch (node.type) {
      case "project":
        // 프로젝트는 폴더가 선택되지 않았을 때만 하이라이트
        return (urlProjectId === node.id || storeProjectId === node.id) && !selectedFolderId;
      case "folder":
        return selectedFolderId === node.id;
      case "item":
        // 아이템: URL 아이템 ID와 비교
        return urlItemId === node.id;
      default:
        return false;
    }
  })();

  const handleClick = () => {
    switch (node.type) {
      case "project":
        // 프로젝트 선택 시 폴더 선택 해제, 프로젝트 홈 표시 (배치 업데이트)
        selectProject(node.id);
        onNodeClick(node);
        break;
      case "folder":
        // 폴더 선택 시 해당 프로젝트 ID도 함께 저장 (배치 업데이트)
        selectFolder(node.id, projectId);
        navigate("/items");
        break;
      case "item":
        // 어셈블리 클릭 시 바로 상세 페이지로 이동 (배치 업데이트)
        clearSelection();
        navigate(`/items/${node.id}`);
        break;
    }
  };

  // 노드 타입별 아이콘 렌더링
  const renderIcon = () => {
    switch (node.type) {
      case "project":
        return (
          <div
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
            style={{ backgroundColor: isSelected ? "var(--brand-500)" : "var(--accent-500)" }}
          >
            <Layers className="h-2.5 w-2.5 text-white" />
          </div>
        );
      case "folder":
        // 폴더: 노란색 폴더 아이콘
        return expanded && hasChildren ? (
          <FolderOpen
            className="h-4 w-4 shrink-0"
            style={{ color: isSelected ? "var(--nav-sidebar-active-text)" : "#fbbf24" }}
          />
        ) : (
          <Folder
            className="h-4 w-4 shrink-0"
            style={{ color: isSelected ? "var(--nav-sidebar-active-text)" : "#fbbf24" }}
          />
        );
      case "item":
        // ASSEMBLY: Box, PART: Cog (기어)
        return node.itemType === "ASSEMBLY" ? (
          <Box
            className="h-4 w-4 shrink-0"
            style={{ color: isSelected ? "var(--nav-sidebar-active-text)" : "var(--brand-500)" }}
          />
        ) : (
          <Cog
            className="h-4 w-4 shrink-0"
            style={{ color: isSelected ? "var(--nav-sidebar-active-text)" : "var(--nav-sidebar-icon)" }}
          />
        );
      default:
        return null;
    }
  };

  // 노드 타입별 추가 버튼 툴팁
  const getAddTooltip = () => {
    switch (node.type) {
      case "project": return "폴더 추가";
      case "folder": return "어셈블리 추가";
      case "item": return "하위 부품 추가";
      default: return "추가";
    }
  };

  return (
    <div>
      <div
        className={cn(
          "group relative flex cursor-pointer items-center rounded-md py-1.5 pr-1 text-[13px] transition-colors",
          isSelected ? "sidebar-tree-item--active" : "sidebar-tree-item"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {/* 왼쪽: 줄어들 수 있는 콘텐츠 영역 */}
        <div className="flex flex-1 min-w-0 items-center gap-1.5">
          {/* Expand/Collapse */}
          <button
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center",
              !hasChildren && "invisible"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
          >
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform",
                expanded && "rotate-90"
              )}
            />
          </button>

          {/* Icon */}
          <div className="shrink-0">
            {renderIcon()}
          </div>

          {/* Name with metadata */}
          <span className={cn("min-w-0 flex-1 truncate", isSelected && "font-medium")}>
            <HighlightedText text={node.name} searchTerm={searchTerm} />
            {/* 어셈블리: 품번 표시 */}
            {node.type === "item" && node.partNumber && (
              <span className="ml-1 text-[10px]" style={{ color: "var(--nav-sidebar-icon)" }}>{node.partNumber}</span>
            )}
            {/* 폴더/어셈블리: 하위 단품 개수 */}
            {(node.type === "folder" || node.type === "item") && node.itemCount !== undefined && node.itemCount > 0 && (
              <span className="ml-1 text-[10px] tabular-nums" style={{ color: "var(--nav-sidebar-icon)" }}>({node.itemCount})</span>
            )}
          </span>
        </div>

        {/* 오른쪽: 항상 고정된 버튼 영역 */}
        <div className="shrink-0 ml-1 flex items-center gap-0.5">
          {node.type === "folder" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="sidebar-tree-action flex h-5 w-5 items-center justify-center rounded opacity-0 transition-all group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBomImport(projectId, node.id);
                  }}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} hideArrow className="sidebar-tooltip">
                BOM 가져오기
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="sidebar-tree-action flex h-5 w-5 items-center justify-center rounded opacity-0 transition-all group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  const childType = node.type === "project" ? "folder" : "item";
                  onAddNode(node.id, node.name, childType);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} hideArrow className="sidebar-tooltip">
              {getAddTooltip()}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Children (구조 노드만: 프로젝트, 폴더, 어셈블리) */}
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              projectId={projectId}
              searchTerm={searchTerm}
              onAddNode={onAddNode}
              onNodeClick={onNodeClick}
              onBomImport={onBomImport}
              urlProjectId={urlProjectId}
              urlItemId={urlItemId}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
