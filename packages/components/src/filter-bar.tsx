import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Badge, Button, Input } from "@fabbit/ui";

export interface FilterChip {
  /** 고유 키 */
  id: string;
  /** 표시 라벨 (예: "공정: CNC 밀링") */
  label: string;
}

export interface FilterBarProps {
  /** 검색어 */
  searchValue: string;
  /** 검색 placeholder */
  searchPlaceholder?: string;
  /** 활성 필터 칩 목록 */
  chips?: FilterChip[];
  /** 검색어 변경 */
  onSearchChange: (value: string) => void;
  /** 필터 칩 제거 */
  onChipRemove?: (chipId: string) => void;
  /** 전체 필터 초기화 */
  onClearAll?: () => void;
  /** 우측 액션 영역 (필터 버튼 등) */
  actions?: ReactNode;
  className?: string;
}

export function FilterBar({
  searchValue,
  searchPlaceholder = "검색...",
  chips = [],
  onSearchChange,
  onChipRemove,
  onClearAll,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <Badge key={chip.id} variant="secondary" className="gap-1 pr-1">
              {chip.label}
              {onChipRemove && (
                <button
                  type="button"
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                  onClick={() => onChipRemove(chip.id)}
                >
                  <X className="size-3" />
                </button>
              )}
            </Badge>
          ))}
          {onClearAll && chips.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={onClearAll}
            >
              전체 해제
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
