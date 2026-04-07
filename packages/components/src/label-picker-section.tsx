import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Settings } from "lucide-react";
import { Button, Input, Checkbox, LabelBadge, Popover, PopoverContent, PopoverTrigger } from "@fabbit/ui";

export interface LabelPickerSectionProps {
  availableLabels?: { id: string; name: string; colorHex: string }[];
  selectedIds?: string[];
  /** 현재 선택된 라벨 표시용 */
  displayLabels: { id?: string; name: string; colorHex: string }[];
  /** 없으면 + 버튼 숨김 (읽기 전용 표시) */
  onSync?: (labelIds: string[]) => void;
  onRequestLabels?: () => void;
  onSearchChange?: (search: string) => void;
  isSearching?: boolean;
  isUpdating?: boolean;
}

export function LabelPickerSection({
  availableLabels = [],
  selectedIds = [],
  displayLabels,
  onSync,
  onRequestLabels,
  onSearchChange,
  isSearching,
  isUpdating,
}: LabelPickerSectionProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearchChange?.(value);
      }, 300);
    },
    [onSearchChange],
  );

  const filtered = availableLabels.filter((label) => {
    if (!query.trim()) return true;
    return label.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">라벨</h3>
        {onSync && (
          <Popover
            open={popoverOpen}
            onOpenChange={(open) => {
              setPopoverOpen(open);
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
              }
              if (open) {
                onRequestLabels?.();
                setDraftIds(selectedIds);
                setQuery("");
                onSearchChange?.("");
              } else {
                setQuery("");
                onSearchChange?.("");
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
            <PopoverContent className="w-72 p-3" align="end">
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">라벨 추가</p>
                <div className="relative">
                  <Input
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="라벨 검색"
                  />
                  {isSearching ? (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    </div>
                  ) : null}
                </div>
                <div className="max-h-48 space-y-1 overflow-auto">
                  {filtered.length === 0 ? (
                    <p className="px-1 py-2 text-xs text-muted-foreground">
                      추가 가능한 라벨이 없습니다.
                    </p>
                  ) : (
                    filtered.map((label) => (
                      <label
                        key={label.id}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                      >
                        <Checkbox
                          checked={draftIds.includes(label.id)}
                          onCheckedChange={(checked) => {
                            setDraftIds((prev) => {
                              if (checked) return [...prev, label.id];
                              return prev.filter((id) => id !== label.id);
                            });
                          }}
                        />
                        <LabelBadge label={label.name} colorHex={label.colorHex} size="sm" />
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
                    if (debounceRef.current) {
                      clearTimeout(debounceRef.current);
                    }
                    onSearchChange?.("");
                    onSync(draftIds);
                    setPopoverOpen(false);
                    setQuery("");
                  }}
                >
                  라벨 적용
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {displayLabels.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {displayLabels.map((l) => (
            <LabelBadge key={l.id ?? l.name} label={l.name} colorHex={l.colorHex} size="md" />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground/50">연결된 라벨 없음</p>
      )}
    </div>
  );
}
