import { useState } from "react";
import {
  Search,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { exportBom } from "@/api/parts";
import type { BomDirection, BomViewType } from "./types";

interface BomToolbarProps {
  partId: string;
  direction: BomDirection;
  onDirectionChange: (d: BomDirection) => void;
  viewType: BomViewType;
  onViewTypeChange: (v: BomViewType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  totalCount: number;
}

export function BomToolbar({
  partId,
  direction,
  onDirectionChange,
  viewType,
  onViewTypeChange,
  searchQuery,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
  totalCount,
}: BomToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportBom(partId, { direction });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 전개 방향 세그먼트 */}
      <div className="inline-flex rounded-md border">
        <button
          onClick={() => onDirectionChange("forward")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-md",
            direction === "forward"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          <ChevronRight className="mr-1 inline h-3 w-3" />
          정전개
        </button>
        <button
          onClick={() => onDirectionChange("reverse")}
          className={cn(
            "border-l px-3 py-1.5 text-xs font-medium transition-colors last:rounded-r-md",
            direction === "reverse"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          <ChevronDown className="mr-1 inline h-3 w-3 rotate-180" />
          역전개
        </button>
      </div>

      {/* 뷰 타입 */}
      <Select
        value={viewType}
        onValueChange={(v) => onViewTypeChange(v as BomViewType)}
      >
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="multi-level">Multi-Level</SelectItem>
          <SelectItem value="single-level">Single-Level</SelectItem>
          <SelectItem value="flattened">Flattened</SelectItem>
        </SelectContent>
      </Select>

      {/* 구분선 */}
      <div className="h-5 w-px bg-border" />

      {/* 펼치기/접기 (Multi-Level에서만) */}
      {viewType === "multi-level" && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={onExpandAll}
          >
            <ChevronsUpDown className="mr-1 h-3 w-3" />
            모두 펼치기
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={onCollapseAll}
          >
            모두 접기
          </Button>
        </div>
      )}

      {/* 검색 */}
      <div className="relative ml-auto">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="품번 / 품명 검색"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-[200px] pl-8 text-xs"
        />
      </div>

      {/* 부품 수 */}
      <span className="text-xs text-muted-foreground">
        총 {totalCount}개 부품
      </span>

      {/* 내려받기 */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 text-xs"
        disabled={isExporting}
        onClick={handleExport}
      >
        {isExporting ? (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        ) : (
          <Download className="mr-1 h-3 w-3" />
        )}
        내려받기
      </Button>
    </div>
  );
}
