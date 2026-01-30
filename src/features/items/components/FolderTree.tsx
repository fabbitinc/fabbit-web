import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Folder, FolderOpen, Plus, Layers, Search, X, Box } from "lucide-react";
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
import { mockFolders } from "../mock-data";
import type { TreeNodeData } from "../types";

// 컨테이너 노드만 필터링 (프로젝트, 폴더, 하위 부품이 있는 어셈블리)
// 단품(leaf item)은 트리에서 숨김
function filterContainerNodes(nodes: TreeNodeData[]): TreeNodeData[] {
  return nodes
    .filter((node) => {
      // 프로젝트, 폴더는 항상 표시
      if (node.type === "project" || node.type === "folder") return true;
      // 아이템은 하위 부품이 있는 경우(어셈블리)만 표시
      if (node.type === "item" && node.children && node.children.length > 0) return true;
      return false;
    })
    .map((node) => ({
      ...node,
      children: node.children ? filterContainerNodes(node.children) : undefined,
      // 하위 단품 개수 계산 (단품 = children이 없는 item)
      itemCount: countLeafItems(node.children),
    }));
}

// 단품(leaf item) 개수 계산
function countLeafItems(children?: TreeNodeData[]): number {
  if (!children) return 0;
  return children.reduce((count, child) => {
    if (child.type === "item" && (!child.children || child.children.length === 0)) {
      return count + 1;
    }
    return count;
  }, 0);
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

  // URL에서 프로젝트 ID 추출
  const projectMatch = location.pathname.match(/^\/projects\/(.+?)(?:\/|$)/);
  const urlProjectId = projectMatch ? projectMatch[1] : undefined;

  // URL에서 아이템 ID 추출 (/items/:id)
  const itemMatch = location.pathname.match(/^\/items\/(.+?)(?:\/|$)/);
  const urlItemId = itemMatch ? itemMatch[1] : undefined;

  const [searchTerm, setSearchTerm] = useState("");
  // 초기에 프로젝트(최상위)는 모두 펼침
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    mockFolders.forEach((node) => {
      if (node.type === "project") {
        initial.add(node.id);
      }
    });
    return initial;
  });
  const [newNodeDialog, setNewNodeDialog] = useState<{
    open: boolean;
    parentId: string | null;
    parentName: string;
    nodeType: "project" | "folder" | "item";
  }>({ open: false, parentId: null, parentName: "", nodeType: "folder" });
  const [newNodeName, setNewNodeName] = useState("");

  // 컨테이너 노드만 필터링 (프로젝트, 폴더, 어셈블리)
  const structureNodes = useMemo(() => filterContainerNodes(mockFolders), []);

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
        setExpandedNodes((prev) => new Set([...prev, ...path]));
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
      // navigate(`/projects/${node.id}`) 대신 /items로 이동하고 프로젝트 선택
      navigate("/items");
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

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col bg-[#0f172a]">
        {/* 검색 바 */}
        <div className="p-3 pb-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              placeholder="프로젝트/폴더 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-[#334155] bg-[#1e293b] py-1.5 pl-8 pr-8 text-xs text-[#e2e8f0] placeholder-[#64748b] outline-none transition-colors focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#64748b] transition-colors hover:bg-[#334155] hover:text-[#e2e8f0]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 트리 헤더 */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#475569]">
            Projects
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex h-5 w-5 items-center justify-center rounded text-[#64748b] transition-colors hover:bg-[#1e293b] hover:text-[#e2e8f0]"
                onClick={() => openNewNodeDialog("root", "루트", "project")}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1e293b] text-white border-[#334155]">
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
                  onAddNode={openNewNodeDialog}
                  onNodeClick={handleNodeClick}
                  urlProjectId={urlProjectId}
                  urlItemId={urlItemId}
                  expandedNodes={expandedNodes}
                  onToggleExpand={toggleExpanded}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-8 w-8 text-[#334155]" />
              <p className="mt-2 text-xs text-[#64748b]">검색 결과가 없습니다</p>
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
            <p className="mb-3 text-sm text-[#64748b]">
              {newNodeDialog.parentId === "root" ? (
                <>새 {newNodeDialog.nodeType === "project" ? "프로젝트" : "폴더"}를 생성합니다.</>
              ) : (
                <>
                  <span className="font-medium text-[#0f172a]">{newNodeDialog.parentName}</span>
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
              className="bg-[#3b82f6] hover:bg-[#2563eb]"
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
  onAddNode: (parentId: string, parentName: string, nodeType?: "project" | "folder" | "item") => void;
  onNodeClick: (node: TreeNodeData) => void;
  urlProjectId?: string;
  urlItemId?: string;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
}

function TreeNode({ node, level, onAddNode, onNodeClick, urlProjectId, urlItemId, expandedNodes, onToggleExpand }: TreeNodeProps) {
  const navigate = useNavigate();
  const expanded = expandedNodes.has(node.id);
  const { selectedFolderId, setSelectedFolderId, setSelectedItemId, selectedProjectId: storeProjectId, setSelectedProjectId } = useItemStore();
  // 구조 노드만 표시하므로 children에서 item 타입은 제외됨
  const hasChildren = node.children && node.children.length > 0;

  // 선택 상태 결정
  // - URL의 아이템 ID (/items/:id)
  // - URL의 프로젝트 ID (/projects/:id)
  // - store의 폴더/프로젝트 ID (부품관리에서 선택)
  const isSelected = (() => {
    switch (node.type) {
      case "project":
        return urlProjectId === node.id || storeProjectId === node.id;
      case "folder":
        return selectedFolderId === node.id;
      case "item":
        // 어셈블리: URL 아이템 ID 또는 store의 폴더 ID와 비교
        return urlItemId === node.id || selectedFolderId === node.id;
      default:
        return false;
    }
  })();

  const handleClick = () => {
    switch (node.type) {
      case "project":
        // 프로젝트 선택 시 폴더 선택 해제, 프로젝트 홈 표시
        setSelectedFolderId("");
        setSelectedItemId(null);
        setSelectedProjectId(node.id);
        onNodeClick(node);
        break;
      case "folder":
        // 폴더 선택 시 프로젝트 선택 해제
        setSelectedFolderId(node.id);
        setSelectedItemId(null);
        setSelectedProjectId(null);
        navigate("/items");
        break;
      case "item":
        // 어셈블리 클릭 시 바로 상세 페이지로 이동
        setSelectedFolderId("");
        setSelectedItemId(null);
        setSelectedProjectId(null);
        navigate(`/items/${node.id}`);
        break;
    }
  };

  // 노드 타입별 아이콘 렌더링
  const renderIcon = () => {
    switch (node.type) {
      case "project":
        return (
          <div className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded",
            isSelected ? "bg-[#3b82f6]" : "bg-[#8b5cf6]"
          )}>
            <Layers className="h-2.5 w-2.5 text-white" />
          </div>
        );
      case "folder":
        // 폴더: 노란색 폴더 아이콘
        return expanded && hasChildren ? (
          <FolderOpen className={cn("h-4 w-4 shrink-0", isSelected ? "text-[#60a5fa]" : "text-[#fbbf24]")} />
        ) : (
          <Folder className={cn("h-4 w-4 shrink-0", isSelected ? "text-[#60a5fa]" : "text-[#fbbf24]")} />
        );
      case "item":
        // 어셈블리: 파란색 박스 아이콘
        return (
          <Box className={cn("h-4 w-4 shrink-0", isSelected ? "text-[#60a5fa]" : "text-[#3b82f6]")} />
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
          isSelected
            ? "bg-[#3b82f6]/10 text-white before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:rounded-full before:bg-[#3b82f6]"
            : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#e2e8f0]"
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
            {node.name}
            {/* 어셈블리: 품번 표시 */}
            {node.type === "item" && node.partNumber && (
              <span className="ml-1 text-[10px] text-[#64748b]">{node.partNumber}</span>
            )}
            {/* 폴더/어셈블리: 하위 단품 개수 */}
            {(node.type === "folder" || node.type === "item") && node.itemCount !== undefined && node.itemCount > 0 && (
              <span className="ml-1 text-[10px] tabular-nums text-[#64748b]">({node.itemCount})</span>
            )}
          </span>
        </div>

        {/* 오른쪽: 항상 고정된 버튼 영역 */}
        <div className="shrink-0 ml-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex h-5 w-5 items-center justify-center rounded text-[#64748b] opacity-0 transition-all hover:bg-[#334155] hover:text-white group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  const childType = node.type === "project" ? "folder" : "item";
                  onAddNode(node.id, node.name, childType);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1e293b] text-white border-[#334155]">
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
              onAddNode={onAddNode}
              onNodeClick={onNodeClick}
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
