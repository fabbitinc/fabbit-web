import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LabelBadge } from "@fabbit/ui";

export interface LabelPickerSectionProps {
  availableLabels?: { id: string; name: string; colorHex: string }[];
  selectedIds?: string[];
  /** 현재 선택된 라벨 표시용 */
  displayLabels: { id?: string; name: string; colorHex: string }[];
  /** 없으면 + 버튼 숨김 (읽기 전용 표시) */
  onSync?: (labelIds: string[]) => void;
  onRequestLabels?: () => void;
  isUpdating?: boolean;
}

export function LabelPickerSection({
  availableLabels = [],
  selectedIds = [],
  displayLabels,
  onSync,
  onRequestLabels,
  isUpdating,
}: LabelPickerSectionProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>([]);

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
              if (open) {
                onRequestLabels?.();
                setDraftIds(selectedIds);
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
            <PopoverContent className="w-72 p-3" align="end">
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">라벨 추가</p>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="라벨 검색"
                />
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
      <div className="mt-2 flex flex-wrap gap-1.5">
        {displayLabels.map((l) => (
          <LabelBadge key={l.id ?? l.name} label={l.name} colorHex={l.colorHex} size="md" />
        ))}
      </div>
    </div>
  );
}
