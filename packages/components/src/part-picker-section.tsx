import { useState, useRef, useCallback } from "react";
import { Settings, Package, Loader2 } from "lucide-react";
import { Button, Badge, Input, Checkbox, Popover, PopoverContent, PopoverTrigger } from "@fabbit/ui";

export interface PartPickerSectionProps {
  searchedParts: { id: string; partNumber: string; name: string | null }[];
  selectedIds: string[];
  /** 현재 선택된 부품 표시용 */
  displayParts: {
    id: string;
    partNumber: string;
    name: string;
    category?: string;
  }[];
  /** 없으면 + 버튼 숨김 (읽기 전용 표시) */
  onSync?: (partIds: string[]) => void;
  onRequestParts?: () => void;
  onSearchChange?: (search: string) => void;
  isSearching?: boolean;
  isUpdating?: boolean;
}

export function PartPickerSection({
  searchedParts,
  selectedIds,
  displayParts,
  onSync,
  onRequestParts,
  onSearchChange,
  isSearching,
  isUpdating,
}: PartPickerSectionProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange?.(value);
      }, 300);
    },
    [onSearchChange],
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">관련 부품</h3>
        {onSync && (
          <Popover
            open={popoverOpen}
            onOpenChange={(open) => {
              setPopoverOpen(open);
              if (open) {
                onRequestParts?.();
                setDraftIds(selectedIds);
                setQuery("");
                onSearchChange?.("");
              } else {
                setQuery("");
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <Settings className="h-3 w-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="end">
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">부품 추가</p>
                <div className="relative">
                  <Input
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="부품번호 또는 이름으로 검색"
                  />
                  {isSearching && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="max-h-48 space-y-1 overflow-auto">
                  {searchedParts.length === 0 ? (
                    <p className="px-1 py-2 text-xs text-muted-foreground">
                      {query.trim()
                        ? "검색 결과가 없습니다."
                        : "프로젝트에 연결된 부품이 없습니다."}
                    </p>
                  ) : (
                    searchedParts.map((part) => (
                      <label
                        key={part.id}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                      >
                        <Checkbox
                          checked={draftIds.includes(part.id)}
                          onCheckedChange={(checked) => {
                            setDraftIds((prev) => {
                              if (checked) return [...prev, part.id];
                              return prev.filter((id) => id !== part.id);
                            });
                          }}
                        />
                        <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">
                            {part.partNumber}
                          </p>
                          {part.name && (
                            <p className="truncate text-[11px] text-muted-foreground">{part.name}</p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  disabled={isUpdating}
                  onClick={() => {
                    onSync(draftIds);
                    setPopoverOpen(false);
                    setQuery("");
                  }}
                >
                  부품 적용
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {displayParts.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {displayParts.map((part) => (
            <div
              key={part.id}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5"
            >
              <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {part.partNumber}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{part.name}</p>
              </div>
              {part.category && (
                <Badge variant="secondary" className="shrink-0 text-[10px] py-0 px-1.5">
                  {part.category}
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground/50">연결된 부품 없음</p>
      )}
    </div>
  );
}
