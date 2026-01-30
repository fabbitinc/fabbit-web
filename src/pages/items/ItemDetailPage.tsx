import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Box,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronRight,
  Eye,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { mockItems, mockFolders } from "@/features/items/mock-data";
import type { ItemData, TreeNodeData } from "@/features/items/types";
import { BOMTabs } from "@/features/items/components/BOMTabs";
import { findParentItems } from "@/features/items/utils/bom-utils";
import { useItemStore } from "@/stores/itemStore";
import { useUploadStore } from "@/stores/uploadStore";

function findItemById(items: ItemData[], id: string): ItemData | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getAllItems(): ItemData[] {
  return Object.values(mockItems).flat();
}

// 트리 노드에서 경로 찾기 (프로젝트/폴더/아이템 포함)
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
      const result = findNodePath(node.children, targetId, [...path, node]);
      if (result) return result;
    }
  }
  return null;
}

// 아이템 경로에서 노드 경로 찾기
function findFullPath(itemId: string): TreeNodeData[] {
  // 먼저 트리에서 직접 찾기
  const treePath = findNodePath(mockFolders, itemId);
  if (treePath) return treePath;

  // 트리에 없으면 mockItems에서 아이템의 상위 폴더 찾기
  for (const [folderId, items] of Object.entries(mockItems)) {
    const item = findItemById(items, itemId);
    if (item) {
      const folderPath = findNodePath(mockFolders, folderId) ?? [];
      // 아이템 경로 구성
      const itemPath = findItemPathInItems(items, itemId);
      if (itemPath) {
        return [...folderPath, ...itemPath.map((i) => ({
          id: i.id,
          name: i.name,
          type: "item" as const,
          partNumber: i.partNumber,
        }))];
      }
    }
  }
  return [];
}

function findItemPathInItems(items: ItemData[], targetId: string, path: ItemData[] = []): ItemData[] | null {
  for (const item of items) {
    if (item.id === targetId) {
      return [...path, item];
    }
    if (item.children) {
      const result = findItemPathInItems(item.children, targetId, [...path, item]);
      if (result) return result;
    }
  }
  return null;
}

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [focusedChildId, setFocusedChildId] = useState<string | null>(null);

  const setSelectedFolderId = useItemStore((state) => state.setSelectedFolderId);
  const setSelectedProjectId = useItemStore((state) => state.setSelectedProjectId);
  const openUploadModal = useUploadStore((state) => state.openModal);

  const allItems = getAllItems();
  const item = findItemById(allItems, id ?? "");
  const breadcrumbPath = findFullPath(id ?? "");
  const parentItems = useMemo(
    () => findParentItems(id ?? "", allItems),
    [id, allItems]
  );

  // 브레드크럼 클릭 핸들러
  const handleBreadcrumbClick = (node: TreeNodeData | null) => {
    if (!node) {
      setSelectedFolderId("");
      setSelectedProjectId(null);
      navigate("/items");
    } else if (node.type === "project") {
      setSelectedFolderId("");
      setSelectedProjectId(node.id);
      navigate("/items");
    } else if (node.type === "folder") {
      setSelectedFolderId(node.id);
      setSelectedProjectId(null);
      navigate("/items");
    } else {
      // item - 상세 페이지로 이동
      navigate(`/items/${node.id}`);
    }
  };

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#64748b]">아이템을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
    approved: { label: "승인됨", bg: "bg-[#ecfdf5]", text: "text-[#059669]", icon: CheckCircle2 },
    draft: { label: "분석중", bg: "bg-[#fffbeb]", text: "text-[#d97706]", icon: Sparkles },
    none: { label: "미등록", bg: "bg-[#f1f5f9]", text: "text-[#64748b]", icon: FileText },
  };

  const status = statusConfig[item.drawingStatus ?? "none"];
  const StatusIcon = status.icon;
  const hasConflicts = item.conflicts && item.conflicts.length > 0;

  const handleOpenFullBOMView = (mode: "forward" | "reverse") => {
    navigate(`/items/${id}/bom?mode=${mode}`);
  };

  return (
    <TooltipProvider delayDuration={0}>
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

      {/* Item Info Card */}
      <div className="mb-4 rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eff6ff]">
            <Box className="h-6 w-6 text-[#3b82f6]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-[#0f172a]">{item.name}</h2>
              <span className="rounded bg-[#f1f5f9] px-2 py-0.5 text-xs font-medium text-[#64748b]">
                {item.partNumber}
              </span>
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                status.bg, status.text
              )}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </span>
              {hasConflicts && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fef2f2] px-2.5 py-0.5 text-xs font-medium text-[#dc2626]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {item.conflicts!.length}건 불일치
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-[#64748b]">
              {item.material && <span className="mr-3">재질: {item.material}</span>}
              {item.quantity && <span>수량: {item.quantity} {item.unit ?? "EA"}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
        {/* Left: Drawing Viewer (70%) */}
        <div className="flex w-[70%] flex-col border-r border-[#e2e8f0] bg-[#f8fafc]">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-white px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#64748b]">도면 뷰어</span>
              {item.aiAnalyzed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#3b82f6]/10 px-2 py-0.5 text-[10px] font-medium text-[#3b82f6]">
                  <Sparkles className="h-3 w-3" />
                  AI 분석됨
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b]">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-xs text-[#64748b]">100%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b]">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="mx-2 h-4 w-px bg-[#e2e8f0]" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b]">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Drawing Area */}
          <div className="relative flex flex-1 items-center justify-center bg-[#f8fafc] p-8">
            <div className="relative h-full w-full rounded-lg border border-[#e2e8f0] bg-[#fafafa] shadow-sm">
              {/* Drawing Placeholder */}
              <div className="flex h-full flex-col items-center justify-center text-[#94a3b8]">
                <svg className="h-32 w-32" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <rect x="5" y="5" width="90" height="70" rx="1" />
                  <line x1="5" y1="15" x2="95" y2="15" />
                  <line x1="25" y1="5" x2="25" y2="75" />
                  <rect x="30" y="20" width="60" height="50" rx="1" strokeDasharray="2 1" />
                  <circle cx="60" cy="45" r="15" />
                  <line x1="45" y1="45" x2="75" y2="45" />
                  <line x1="60" y1="30" x2="60" y2="60" />
                  <text x="8" y="12" fontSize="4" fill="currentColor">TITLE BLOCK</text>
                  <text x="8" y="25" fontSize="3" fill="currentColor">PART NO.</text>
                  <text x="8" y="35" fontSize="3" fill="currentColor">MATERIAL</text>
                </svg>
                <p className="mt-4 text-sm">도면 미리보기</p>
                <p className="text-xs text-[#cbd5e1]">DWG-{item.partNumber}</p>
              </div>

              {/* AI Analysis Overlay */}
              {item.aiAnalyzed && (
                <>
                  <div className="absolute left-[5%] top-[7%] h-[12%] w-[20%] rounded border-2 border-[#3b82f6] bg-[#3b82f6]/5">
                    <span className="absolute -top-5 left-0 flex items-center gap-1 rounded bg-[#3b82f6] px-1.5 py-0.5 text-[9px] font-medium text-white">
                      <Sparkles className="h-2.5 w-2.5" />
                      표제란
                    </span>
                  </div>

                  <div className="absolute left-[5%] top-[22%] h-[25%] w-[20%] rounded border-2 border-[#8b5cf6] bg-[#8b5cf6]/5">
                    <span className="absolute -top-5 left-0 flex items-center gap-1 rounded bg-[#8b5cf6] px-1.5 py-0.5 text-[9px] font-medium text-white">
                      <Sparkles className="h-2.5 w-2.5" />
                      부품표
                    </span>
                  </div>

                  <div
                    className={cn(
                      "absolute right-[18%] top-[25%] h-[45%] w-[50%] rounded border-2 transition-all duration-200",
                      focusedChildId
                        ? "border-[#f59e0b] bg-[#f59e0b]/10"
                        : "border-[#22c55e] bg-[#22c55e]/5"
                    )}
                  >
                    <span className={cn(
                      "absolute -top-5 left-0 flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium text-white transition-colors",
                      focusedChildId ? "bg-[#f59e0b]" : "bg-[#22c55e]"
                    )}>
                      <Sparkles className="h-2.5 w-2.5" />
                      {focusedChildId ? "선택된 부품" : "주요 형상"}
                    </span>
                  </div>

                  <div className="absolute bottom-[15%] right-[8%] h-[8%] w-[25%] rounded border-2 border-[#06b6d4] bg-[#06b6d4]/5">
                    <span className="absolute -bottom-5 left-0 flex items-center gap-1 rounded bg-[#06b6d4] px-1.5 py-0.5 text-[9px] font-medium text-white">
                      <Sparkles className="h-2.5 w-2.5" />
                      치수
                    </span>
                  </div>
                </>
              )}

              {/* AI Badge */}
              {item.aiAnalyzed && (
                <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-[#0f172a] px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                  <Sparkles className="h-3.5 w-3.5 text-[#3b82f6]" />
                  AI 분석 완료
                  <span className="text-[#64748b]">·</span>
                  <span className="text-[#94a3b8]">4개 영역 인식</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Info Panel (30%) */}
        <div className="flex w-[30%] flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto">
            {/* Conflict Detection Card */}
            {hasConflicts && (
              <div className="p-4">
                <div className="overflow-hidden rounded-xl border border-[#fecaca] bg-gradient-to-b from-[#fef2f2] to-white shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#fecaca]/50 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dc2626]">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#dc2626]">불일치 감지됨</p>
                      <p className="text-xs text-[#64748b]">AI가 {item.conflicts!.length}건의 데이터 불일치를 발견했습니다</p>
                    </div>
                  </div>

                  <div className="p-4">
                    {item.conflicts!.map((conflict, idx) => (
                      <div key={conflict.id} className={cn(idx > 0 && "mt-3 border-t border-[#fee2e2] pt-3")}>
                        <div className="mb-2 flex items-center gap-2">
                          <span className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                            conflict.severity === "error" ? "bg-[#dc2626] text-white" : "bg-[#f59e0b] text-white"
                          )}>
                            {conflict.severity === "error" ? "오류" : "주의"}
                          </span>
                          <span className="text-xs font-medium text-[#0f172a]">{conflict.field}</span>
                        </div>

                        <div className="flex items-stretch gap-2">
                          <div className="flex-1 rounded-lg bg-[#f0fdf4] p-3 text-center">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-[#22c55e]">도면</p>
                            <p className="mt-1 font-mono text-sm font-semibold text-[#059669]">{conflict.drawingValue}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs font-bold text-[#94a3b8]">VS</span>
                          </div>
                          <div className="flex-1 rounded-lg bg-[#fef2f2] p-3 text-center">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-[#ef4444]">엑셀</p>
                            <p className="mt-1 font-mono text-sm font-semibold text-[#dc2626]">{conflict.excelValue}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-px bg-[#f1f5f9]">
              <div className="bg-white p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">재질</p>
                <p className="mt-1 text-sm font-medium text-[#0f172a]">{item.material ?? "-"}</p>
              </div>
              <div className="bg-white p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">수량</p>
                <p className="mt-1 text-sm font-medium text-[#0f172a]">{item.quantity} {item.unit ?? "EA"}</p>
              </div>
              <div className="bg-white p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">도면번호</p>
                <p className="mt-1 font-mono text-sm font-medium text-[#0f172a]">DWG-{item.partNumber}</p>
              </div>
              <div className="bg-white p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">최종수정</p>
                <p className="mt-1 text-sm font-medium text-[#0f172a]">2024-01-15</p>
              </div>
            </div>

            {/* Related Documents */}
            <div className="border-t border-[#f1f5f9] p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">관련 문서</p>
              <div className="mt-3 space-y-2">
                <div className="group flex items-center gap-3 rounded-lg border border-[#e2e8f0] p-3 transition-all hover:border-[#3b82f6]/30 hover:bg-[#f8fafc] hover:shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fef2f2] transition-transform group-hover:scale-105">
                    <FileText className="h-5 w-5 text-[#ef4444]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0f172a]">도면.pdf</p>
                    <p className="text-xs text-[#94a3b8]">2.4 MB · 2024-01-15</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b] hover:text-[#3b82f6]">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>미리보기</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b] hover:text-[#3b82f6]">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>다운로드</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className="group flex items-center gap-3 rounded-lg border border-[#e2e8f0] p-3 transition-all hover:border-[#3b82f6]/30 hover:bg-[#f8fafc] hover:shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0fdf4] transition-transform group-hover:scale-105">
                    <Box className="h-5 w-5 text-[#22c55e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0f172a]">3D모델.step</p>
                    <p className="text-xs text-[#94a3b8]">15.8 MB · 2024-01-14</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b] hover:text-[#3b82f6]">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>미리보기</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b] hover:text-[#3b82f6]">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>다운로드</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            {/* BOM Quick View */}
            <div className="border-t border-[#f1f5f9]">
              <BOMTabs
                item={item}
                parentItems={parentItems}
                onFocus={setFocusedChildId}
                focusedId={focusedChildId}
                onOpenFullView={handleOpenFullBOMView}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
