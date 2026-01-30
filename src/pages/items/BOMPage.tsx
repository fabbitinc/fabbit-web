import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Download,
  RefreshCw,
  History,
  Check,
  X,
  Pencil,
  Plus,
  Minus,
  GitBranchPlus,
  GitMerge,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { mockItems } from "@/features/items/mock-data";
import type { ItemData } from "@/features/items/types";
import { findParentItems, type ParentItem } from "@/features/items/utils/bom-utils";

type ViewMode = "forward" | "reverse";

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

// 트리를 평탄화하여 테이블 행으로 변환
interface FlattenedRow {
  item: ItemData;
  level: number;
  hasChildren: boolean;
  parentId: string | null; // 부모 ID 추가
}

function flattenTree(item: ItemData, level: number = 0, parentId: string | null = null): FlattenedRow[] {
  const rows: FlattenedRow[] = [];
  const hasChildren = !!(item.children && item.children.length > 0);

  rows.push({ item, level, hasChildren, parentId });

  if (item.children) {
    for (const child of item.children) {
      rows.push(...flattenTree(child, level + 1, item.id));
    }
  }

  return rows;
}

// 편집 가능한 셀 컴포넌트
interface EditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  className?: string;
}

function EditableCell({ value, onChange, type = "text", className }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded border border-[#3b82f6] bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20"
          autoFocus
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-[#22c55e] hover:text-[#16a34a]"
          onClick={handleSave}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-[#ef4444] hover:text-[#dc2626]"
          onClick={handleCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-[#f8fafc]",
        className
      )}
      onDoubleClick={() => setIsEditing(true)}
    >
      <span className="flex-1">{value || "-"}</span>
      <Pencil className="h-3 w-3 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// BOM 전개 테이블 행 컴포넌트
interface BOMRowProps {
  row: FlattenedRow;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: (id: string) => void;
}

function BOMRow({ row, isExpanded, onToggle, onNavigate }: BOMRowProps) {
  const { item, level, hasChildren } = row;
  const [quantity, setQuantity] = useState(item.quantity);
  const [material, setMaterial] = useState(item.material ?? "");

  return (
    <tr className={cn(
      "border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors",
      level === 0 && "bg-[#fafafa]"
    )}>
      {/* 트리 구조 (고정 컬럼) */}
      <td className="sticky left-0 z-10 bg-inherit border-r border-[#e2e8f0]">
        <div
          className="flex items-center gap-2 py-2 px-3"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren ? (
            <button
              className="flex h-5 w-5 items-center justify-center rounded text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a] transition-colors"
              onClick={onToggle}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium truncate",
                level === 0 ? "text-sm text-[#0f172a]" : "text-sm text-[#334155]"
              )}>
                {item.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-[#94a3b8] hover:text-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onNavigate(item.id)}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <span className="font-mono text-xs text-[#94a3b8]">{item.partNumber}</span>
          </div>
        </div>
      </td>

      {/* 수량 */}
      <td className="px-3 py-2 text-right">
        <EditableCell
          value={quantity}
          onChange={(v) => setQuantity(Number(v))}
          type="number"
          className="font-mono text-sm justify-end"
        />
      </td>

      {/* 단위 */}
      <td className="px-3 py-2 text-center text-sm text-[#64748b]">
        {item.unit ?? "EA"}
      </td>

      {/* 재질 */}
      <td className="px-3 py-2">
        <EditableCell
          value={material}
          onChange={setMaterial}
          className="text-sm"
        />
      </td>

      {/* 단가 */}
      <td className="px-3 py-2 text-right">
        <EditableCell
          value="0"
          onChange={() => {}}
          type="number"
          className="font-mono text-sm justify-end"
        />
      </td>

      {/* 제조사 */}
      <td className="px-3 py-2">
        <EditableCell
          value="-"
          onChange={() => {}}
          className="text-sm"
        />
      </td>

      {/* 리드타임 */}
      <td className="px-3 py-2 text-right">
        <EditableCell
          value="-"
          onChange={() => {}}
          className="text-sm justify-end"
        />
      </td>

      {/* 상태 */}
      <td className="px-3 py-2 text-center">
        <span className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
          item.drawingStatus === "approved" && "bg-[#ecfdf5] text-[#059669]",
          item.drawingStatus === "draft" && "bg-[#fffbeb] text-[#d97706]",
          (!item.drawingStatus || item.drawingStatus === "none") && "bg-[#f1f5f9] text-[#64748b]"
        )}>
          {item.drawingStatus === "approved" ? "승인" : item.drawingStatus === "draft" ? "검토중" : "미등록"}
        </span>
      </td>
    </tr>
  );
}

// 역전개 행 컴포넌트
interface ReverseRowProps {
  parentItem: ParentItem;
  onNavigate: (id: string) => void;
}

function ReverseRow({ parentItem, onNavigate }: ReverseRowProps) {
  const { item, usageQuantity } = parentItem;

  return (
    <tr className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-[#0f172a] truncate">
                {item.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-[#94a3b8] hover:text-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onNavigate(item.id)}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <span className="font-mono text-xs text-[#94a3b8]">{item.partNumber}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-[#0f172a]">
        {usageQuantity}
      </td>
      <td className="px-4 py-3 text-sm text-[#64748b]">
        {item.unit ?? "EA"}
      </td>
      <td className="px-4 py-3 text-sm text-[#64748b]">
        {item.material ?? "-"}
      </td>
      <td className="px-4 py-3">
        <span className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
          item.drawingStatus === "approved" && "bg-[#ecfdf5] text-[#059669]",
          item.drawingStatus === "draft" && "bg-[#fffbeb] text-[#d97706]",
          (!item.drawingStatus || item.drawingStatus === "none") && "bg-[#f1f5f9] text-[#64748b]"
        )}>
          {item.drawingStatus === "approved" ? "승인" : item.drawingStatus === "draft" ? "검토중" : "미등록"}
        </span>
      </td>
    </tr>
  );
}

export function BOMPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = (searchParams.get("mode") as ViewMode) ?? "forward";
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedRevision, setSelectedRevision] = useState("v1.0");

  const allItems = getAllItems();
  const item = findItemById(allItems, id ?? "");
  const parentItems = useMemo(
    () => findParentItems(id ?? "", allItems),
    [id, allItems]
  );

  // 전개 데이터 준비
  const flatRows = useMemo(() => {
    if (!item) return [];
    return flattenTree(item);
  }, [item]);

  // 펼침/접힘 필터링 - 실제 부모-자식 관계 기반
  const visibleRows = useMemo(() => {
    // id로 row를 빠르게 찾기 위한 맵
    const rowMap = new Map<string, FlattenedRow>();
    for (const row of flatRows) {
      rowMap.set(row.item.id, row);
    }

    // 조상 중 접힌 노드가 있는지 확인
    const isAncestorCollapsed = (row: FlattenedRow): boolean => {
      let currentParentId = row.parentId;
      while (currentParentId) {
        // 부모가 expanded가 아니면 (접혀있으면) 이 노드는 숨겨져야 함
        if (!expandedIds.has(currentParentId)) {
          return true;
        }
        const parentRow = rowMap.get(currentParentId);
        currentParentId = parentRow?.parentId ?? null;
      }
      return false;
    };

    return flatRows.filter(row => {
      // 루트는 항상 보임
      if (row.parentId === null) return true;
      // 조상 중 접힌 노드가 없으면 보임
      return !isAncestorCollapsed(row);
    });
  }, [flatRows, expandedIds]);

  // 초기에 1단계만 펼침
  useEffect(() => {
    if (item) {
      setExpandedIds(new Set([item.id]));
    }
  }, [item]);

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#64748b]">아이템을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const toggleExpand = (itemId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = flatRows.filter(r => r.hasChildren).map(r => r.item.id);
    setExpandedIds(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleExportExcel = () => {
    // TODO: 엑셀 내보내기 구현
    alert("엑셀 내보내기 기능 (추후 구현)");
  };

  const handleAIRescan = () => {
    // TODO: AI 재검사 구현
    alert("AI 일괄 재검사 기능 (추후 구현)");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col bg-[#f8fafc]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-[#64748b] hover:text-[#0f172a]"
              onClick={() => navigate(`/items/${id}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="mb-1 flex items-center gap-1 text-xs">
                <Link to="/items" className="text-[#64748b] transition-colors hover:text-[#3b82f6]">
                  Items
                </Link>
                <ChevronRight className="h-3 w-3 text-[#cbd5e1]" />
                <Link to={`/items/${id}`} className="text-[#64748b] transition-colors hover:text-[#3b82f6]">
                  {item.name}
                </Link>
                <ChevronRight className="h-3 w-3 text-[#cbd5e1]" />
                <span className="font-medium text-[#0f172a]">BOM</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-[#0f172a]">
                  {viewMode === "forward" ? "BOM 전개" : "BOM 역전개"}
                </h1>
                <span className="font-mono text-sm text-[#64748b]">{item.partNumber}</span>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-1">
              <button
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  viewMode === "forward"
                    ? "bg-white text-[#3b82f6] shadow-sm"
                    : "text-[#64748b] hover:text-[#0f172a]"
                )}
                onClick={() => setViewMode("forward")}
              >
                <GitBranchPlus className="h-4 w-4" />
                전개
              </button>
              <button
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  viewMode === "reverse"
                    ? "bg-white text-[#8b5cf6] shadow-sm"
                    : "text-[#64748b] hover:text-[#0f172a]"
                )}
                onClick={() => setViewMode("reverse")}
              >
                <GitMerge className="h-4 w-4" />
                역전개
              </button>
            </div>

            <div className="h-6 w-px bg-[#e2e8f0]" />

            {/* Revision Selector */}
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-[#64748b]" />
              <select
                value={selectedRevision}
                onChange={(e) => setSelectedRevision(e.target.value)}
                className="rounded-md border border-[#e2e8f0] bg-white px-2 py-1.5 text-sm text-[#0f172a] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20"
              >
                <option value="v1.0">v1.0 (현재)</option>
                <option value="v0.9">v0.9</option>
                <option value="v0.8">v0.8</option>
              </select>
            </div>

            <div className="h-6 w-px bg-[#e2e8f0]" />

            {/* Actions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleAIRescan}
                >
                  <RefreshCw className="h-4 w-4" />
                  AI 재검사
                </Button>
              </TooltipTrigger>
              <TooltipContent>도면을 기반으로 BOM 재분석</TooltipContent>
            </Tooltip>

            <Button
              variant="default"
              size="sm"
              className="gap-1.5 bg-[#22c55e] hover:bg-[#16a34a]"
              onClick={handleExportExcel}
            >
              <Download className="h-4 w-4" />
              엑셀 내보내기
            </Button>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="h-full rounded-lg border border-[#e2e8f0] bg-white shadow-sm overflow-hidden">
            {viewMode === "forward" ? (
              <>
                {/* Expand/Collapse Controls */}
                <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-[#fafafa] px-4 py-2">
                  <span className="text-sm text-[#64748b]">
                    총 {flatRows.length}개 부품
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={expandAll}
                    >
                      <Plus className="h-3 w-3" />
                      모두 펼치기
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={collapseAll}
                    >
                      <Minus className="h-3 w-3" />
                      모두 접기
                    </Button>
                  </div>
                </div>

                {/* BOM Table */}
                <div className="overflow-auto h-[calc(100%-41px)]">
                  <table className="w-full border-collapse table-fixed">
                    <thead className="sticky top-0 z-20 bg-[#f8fafc]">
                      <tr className="border-b border-[#e2e8f0]">
                        <th className="sticky left-0 z-30 bg-[#f8fafc] border-r border-[#e2e8f0] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[300px]">
                          품목
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[100px]">
                          수량
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[80px]">
                          단위
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[120px]">
                          재질
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[120px]">
                          단가 (원)
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[120px]">
                          제조사
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[100px]">
                          리드타임
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[100px]">
                          상태
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((row) => (
                        <BOMRow
                          key={row.item.id}
                          row={row}
                          isExpanded={expandedIds.has(row.item.id)}
                          onToggle={() => toggleExpand(row.item.id)}
                          onNavigate={(itemId) => navigate(`/items/${itemId}`)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                {/* Reverse BOM Header */}
                <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-[#fafafa] px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#64748b]">
                      {item.name}이(가) 사용된 상위 품목
                    </span>
                    <span className="rounded-full bg-[#8b5cf6]/10 px-2 py-0.5 text-xs font-medium text-[#8b5cf6]">
                      {parentItems.length}개
                    </span>
                  </div>
                </div>

                {/* Reverse BOM Table */}
                <div className="overflow-auto h-[calc(100%-41px)]">
                  {parentItems.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f5f9]">
                          <GitMerge className="h-8 w-8 text-[#94a3b8]" />
                        </div>
                        <p className="text-[#64748b]">상위 품목이 없습니다.</p>
                        <p className="text-sm text-[#94a3b8]">이 품목은 최상위 품목입니다.</p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 z-20 bg-[#f8fafc]">
                        <tr className="border-b border-[#e2e8f0]">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                            상위 품목
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[100px]">
                            사용 수량
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[80px]">
                            단위
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[120px]">
                            재질
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#64748b] w-[100px]">
                            상태
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parentItems.map((parentItem) => (
                          <ReverseRow
                            key={parentItem.item.id}
                            parentItem={parentItem}
                            onNavigate={(itemId) => navigate(`/items/${itemId}`)}
                          />
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer with hint */}
        <div className="border-t border-[#e2e8f0] bg-white px-6 py-2">
          <p className="text-xs text-[#94a3b8]">
            셀을 더블클릭하여 편집할 수 있습니다. Enter로 저장, Esc로 취소합니다.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
