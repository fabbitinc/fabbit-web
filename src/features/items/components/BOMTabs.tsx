import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, ExternalLink, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ItemData } from "../types";
import type { ParentItem } from "../utils/bom-utils";

type TabType = "forward" | "reverse";

// 트리 노드 컴포넌트
interface TreeNodeProps {
  item: ItemData;
  level: number;
  onFocus?: (id: string | null) => void;
  focusedId?: string | null;
}

function TreeNode({ item, level, onFocus, focusedId }: TreeNodeProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 py-2.5 px-3 cursor-pointer transition-colors",
          focusedId === item.id
            ? "bg-[#3b82f6]/10 border-l-2 border-l-[#3b82f6]"
            : "hover:bg-[#f8fafc] border-l-2 border-l-transparent"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onFocus?.(focusedId === item.id ? null : item.id)}
      >
        {hasChildren ? (
          <button
            className="flex h-5 w-5 items-center justify-center text-[#94a3b8] hover:text-[#64748b]"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
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
              "text-sm truncate",
              focusedId === item.id ? "font-medium text-[#0f172a]" : "text-[#334155]"
            )}>
              {item.name}
            </span>
            <span className="text-xs tabular-nums text-[#64748b]">
              x{item.quantity}
            </span>
          </div>
          <p className="font-mono text-xs text-[#94a3b8] truncate mt-0.5">
            {item.partNumber}
          </p>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-[#94a3b8] opacity-0 transition-all hover:text-[#3b82f6] group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/items/${item.id}`);
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">상세 보기</TooltipContent>
        </Tooltip>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              level={level + 1}
              onFocus={onFocus}
              focusedId={focusedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BOMTabsProps {
  item: ItemData;
  parentItems: ParentItem[];
  onFocus?: (id: string | null) => void;
  focusedId?: string | null;
  onOpenFullView?: (mode: "forward" | "reverse") => void;
}

export function BOMTabs({ item, parentItems, onFocus, focusedId, onOpenFullView }: BOMTabsProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("forward");

  const childCount = item.children?.length ?? 0;
  const parentCount = parentItems.length;

  return (
    <div className="flex flex-col">
      {/* Tab Headers */}
      <div className="flex items-center border-b border-[#e2e8f0]">
        <button
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
            activeTab === "forward"
              ? "text-[#3b82f6]"
              : "text-[#64748b] hover:text-[#0f172a]"
          )}
          onClick={() => setActiveTab("forward")}
        >
          <span>BOM 전개</span>
          {childCount > 0 && (
            <span className={cn(
              "ml-1.5 text-xs",
              activeTab === "forward" ? "text-[#3b82f6]" : "text-[#94a3b8]"
            )}>
              ({childCount})
            </span>
          )}
          {activeTab === "forward" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b82f6]" />
          )}
        </button>
        <button
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
            activeTab === "reverse"
              ? "text-[#8b5cf6]"
              : "text-[#64748b] hover:text-[#0f172a]"
          )}
          onClick={() => setActiveTab("reverse")}
        >
          <span>BOM 역전개</span>
          {parentCount > 0 && (
            <span className={cn(
              "ml-1.5 text-xs",
              activeTab === "reverse" ? "text-[#8b5cf6]" : "text-[#94a3b8]"
            )}>
              ({parentCount})
            </span>
          )}
          {activeTab === "reverse" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b5cf6]" />
          )}
        </button>

        {/* Full View Button */}
        {onOpenFullView && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-2 text-[#94a3b8] hover:text-[#3b82f6]"
                onClick={() => onOpenFullView(activeTab)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>전체 화면으로 보기</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Tab Content */}
      <div className="max-h-[320px] overflow-y-auto">
        {activeTab === "forward" ? (
          childCount === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-[#94a3b8]">
              하위 부품이 없습니다.
            </div>
          ) : (
            <div className="py-2">
              {item.children!.map((child) => (
                <TreeNode
                  key={child.id}
                  item={child}
                  level={0}
                  onFocus={onFocus}
                  focusedId={focusedId}
                />
              ))}
            </div>
          )
        ) : (
          parentCount === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-[#94a3b8]">
              상위 품목이 없습니다.
            </div>
          ) : (
            <div className="py-2">
              {parentItems.map(({ item: parentItem, usageQuantity }) => (
                <div
                  key={parentItem.id}
                  className={cn(
                    "group flex items-center gap-3 py-2.5 px-3 cursor-pointer transition-colors",
                    focusedId === parentItem.id
                      ? "bg-[#8b5cf6]/10 border-l-2 border-l-[#8b5cf6]"
                      : "hover:bg-[#f8fafc] border-l-2 border-l-transparent"
                  )}
                  onClick={() => onFocus?.(focusedId === parentItem.id ? null : parentItem.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm truncate",
                        focusedId === parentItem.id ? "font-medium text-[#0f172a]" : "text-[#334155]"
                      )}>
                        {parentItem.name}
                      </span>
                      <span className="rounded bg-[#f1f5f9] px-1.5 py-0.5 text-xs text-[#64748b]">
                        x{usageQuantity}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-[#94a3b8] truncate mt-0.5">
                      {parentItem.partNumber}
                    </p>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-[#94a3b8] opacity-0 transition-all hover:text-[#8b5cf6] group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/items/${parentItem.id}`);
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">상세 보기</TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
