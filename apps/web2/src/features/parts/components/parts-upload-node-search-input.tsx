import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Input, Popover, PopoverAnchor, PopoverContent } from "@fabbit/ui";
import { useNodeSearchQuery } from "@/features/parts/hooks/use-node-search-query";

interface PartsUploadNodeSearchInputProps {
  nodeLabel: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export function PartsUploadNodeSearchInput({
  nodeLabel,
  onChange,
  placeholder,
  value,
}: PartsUploadNodeSearchInputProps) {
  const [draftValue, setDraftValue] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState(value.trim());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setDraftValue(value);
    setDebouncedValue(value.trim());
  }, [value]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedValue(draftValue.trim());
    }, 300);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [draftValue]);

  const searchQuery = useNodeSearchQuery(
    {
      label: nodeLabel,
      search: debouncedValue,
      limit: 8,
    },
    isOpen && debouncedValue.length > 0,
  );

  const canUseRawValue = useMemo(() => {
    const normalized = draftValue.trim();

    if (!normalized) {
      return false;
    }

    return !(searchQuery.data ?? []).some((item) => item.value === normalized);
  }, [draftValue, searchQuery.data]);

  return (
    <Popover open={isOpen && draftValue.trim().length > 0} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div className="relative flex-1">
          <Input
            className="pr-9"
            placeholder={placeholder}
            value={draftValue}
            onChange={(event) => {
              const nextValue = event.target.value;
              setDraftValue(nextValue);
              onChange(nextValue);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (draftValue.trim()) {
                setIsOpen(true);
              }
            }}
          />
          {searchQuery.isFetching ? (
            <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      </PopoverAnchor>

      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1">
        <div className="max-h-52 overflow-y-auto">
          {(searchQuery.data ?? []).map((item) => (
            <button
              key={`${item.value}-${item.label ?? ""}`}
              type="button"
              className="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/70"
              onClick={() => {
                onChange(item.value);
                setIsOpen(false);
              }}
            >
              <span className="font-medium text-foreground">{item.label ?? item.value}</span>
              {item.label && item.label !== item.value ? (
                <span className="text-xs text-muted-foreground">{item.value}</span>
              ) : null}
            </button>
          ))}

          {!searchQuery.isFetching && canUseRawValue ? (
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/70"
              onClick={() => {
                onChange(draftValue.trim());
                setIsOpen(false);
              }}
            >
              <Plus className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="font-medium text-foreground">{draftValue.trim()}</span>
                <span className="ml-1 text-muted-foreground">직접 입력 사용</span>
              </span>
            </button>
          ) : null}

          {!searchQuery.isFetching && (searchQuery.data ?? []).length === 0 && !canUseRawValue ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">검색 결과가 없습니다.</div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
