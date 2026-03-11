import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Settings } from "lucide-react";
import { Button, Input, Checkbox, Popover, PopoverContent, PopoverTrigger, UserAvatar } from "@fabbit/ui";

export interface MemberPickerSectionProps {
  /** 섹션 제목 (예: "담당자", "검토자") */
  label: string;
  /** 적용 버튼 텍스트 (예: "담당자 적용", "검토자 적용") */
  applyLabel: string;
  availableMembers?: { id: string; name: string; email: string }[];
  selectedIds?: string[];
  /** 현재 선택된 항목 표시용 (아바타+이름) */
  displayItems: { id?: string; name: string; profileImageUrl?: string | null }[];
  /** 없으면 + 버튼 숨김 (읽기 전용 표시) */
  onSync?: (userIds: string[]) => void;
  onRequestMembers?: () => void;
  onSearchChange?: (search: string) => void;
  isSearching?: boolean;
  isUpdating?: boolean;
}

export function MemberPickerSection({
  label,
  applyLabel,
  availableMembers = [],
  selectedIds = [],
  displayItems,
  onSync,
  onRequestMembers,
  onSearchChange,
  isSearching,
  isUpdating,
}: MemberPickerSectionProps) {
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

  const filtered = availableMembers.filter((m) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
        {onSync && (
          <Popover
            open={popoverOpen}
            onOpenChange={(open) => {
              setPopoverOpen(open);
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
              }
              if (open) {
                onRequestMembers?.();
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
                <p className="text-xs font-medium text-foreground">
                  {applyLabel.replace("적용", "추가")}
                </p>
                <div className="relative">
                  <Input
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="멤버 검색"
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
                      추가 가능한 멤버가 없습니다.
                    </p>
                  ) : (
                    filtered.map((member) => (
                      <label
                        key={member.id}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                      >
                        <Checkbox
                          checked={draftIds.includes(member.id)}
                          onCheckedChange={(checked) => {
                            setDraftIds((prev) => {
                              if (checked) return [...prev, member.id];
                              return prev.filter((id) => id !== member.id);
                            });
                          }}
                        />
                        <UserAvatar name={member.name} className="h-5 w-5 text-[10px]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-foreground">{member.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{member.email}</p>
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
                    if (debounceRef.current) {
                      clearTimeout(debounceRef.current);
                    }
                    onSearchChange?.("");
                    onSync(draftIds);
                    setPopoverOpen(false);
                    setQuery("");
                  }}
                >
                  {applyLabel}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="mt-2 space-y-2">
        {displayItems.map((item) => (
          <div key={item.id ?? item.name} className="flex items-center gap-2">
            <UserAvatar
              name={item.name}
              imageUrl={item.profileImageUrl}
              className="h-6 w-6 text-[10px]"
            />
            <span className="text-sm text-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
