import * as React from "react";
import { Search, X, Check } from "lucide-react";

import { cn } from "./lib/cn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Checkbox } from "./checkbox";

/* ── 타입 ── */

type MultiSelectItem = {
  value: string;
  label: string;
  color?: string;
};

type MultiSelectPopoverProps = {
  items: MultiSelectItem[];
  selectedValues: string[];
  onSelectedChange: (values: string[]) => void;
  title?: string;
  searchPlaceholder?: string;
  submitLabel?: string;
  emptyMessage?: string;
  trigger: React.ReactNode;
  design?: "default" | "minimal" | "chip" | "bordered" | "pill";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/* ── 색상 유틸 ── */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return null;
  return {
    r: Number.parseInt(match[1], 16),
    g: Number.parseInt(match[2], 16),
    b: Number.parseInt(match[3], 16),
  };
}

function colorStyle(hex?: string) {
  if (!hex) return {};
  const rgb = hexToRgb(hex);
  if (!rgb) return {};
  return {
    "--item-color": hex,
    "--item-bg": `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
    "--item-border": `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`,
    "--item-text": `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`,
  } as React.CSSProperties;
}

/* ── 아이템 렌더러 (design별) ── */

function ItemLabel({
  item,
  design,
}: {
  item: MultiSelectItem;
  design: NonNullable<MultiSelectPopoverProps["design"]>;
}) {
  const style = colorStyle(item.color);

  // minimal: 컬러 텍스트만
  if (design === "minimal") {
    return (
      <span className="text-sm" style={item.color ? { color: item.color } : undefined}>
        {item.label}
      </span>
    );
  }

  // chip: 사각 칩 + 테두리
  if (design === "chip") {
    return (
      <span
        className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
        style={{
          ...style,
          backgroundColor: "var(--item-bg)",
          color: "var(--item-text)",
          border: "1px solid var(--item-border)",
        }}
      >
        {item.label}
      </span>
    );
  }

  // bordered: 색상 도트 + 텍스트
  if (design === "bordered") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <span
          className="size-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: item.color ?? "var(--color-muted-foreground)" }}
        />
        {item.label}
      </span>
    );
  }

  // pill: 솔리드 둥근 배지
  if (design === "pill") {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{
          ...style,
          backgroundColor: item.color ?? "var(--color-muted)",
          color: "#fff",
        }}
      >
        {item.label}
      </span>
    );
  }

  // default: 컬러 배지 (둥근 + 반투명 배경)
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        ...style,
        backgroundColor: "var(--item-bg)",
        color: "var(--item-text)",
        border: "1px solid var(--item-border)",
      }}
    >
      {item.label}
    </span>
  );
}

/* ── 체크 인디케이터 (design별) ── */

function CheckIndicator({
  checked,
  design,
}: {
  checked: boolean;
  design: NonNullable<MultiSelectPopoverProps["design"]>;
}) {
  // pill: 원형 체크
  if (design === "pill") {
    return (
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30",
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
    );
  }

  // minimal: 심플 체크마크 (체크박스 없음)
  if (design === "minimal") {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center">
        {checked && <Check className="text-primary size-4" strokeWidth={2.5} />}
      </span>
    );
  }

  // bordered: 커스텀 스퀘어 체크
  if (design === "bordered") {
    return (
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input",
        )}
      >
        {checked && <Check className="size-3" />}
      </span>
    );
  }

  // default, chip: Radix Checkbox
  return (
    <Checkbox checked={checked} tabIndex={-1} className="pointer-events-none" />
  );
}

/* ── 메인 컴포넌트 ── */

function MultiSelectPopover({
  items,
  selectedValues,
  onSelectedChange,
  title,
  searchPlaceholder = "검색...",
  submitLabel,
  emptyMessage = "결과 없음",
  trigger,
  design = "default",
  open,
  onOpenChange,
}: MultiSelectPopoverProps) {
  const [search, setSearch] = React.useState("");
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [pending, setPending] = React.useState<string[]>(selectedValues);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled
    ? (v: boolean) => onOpenChange?.(v)
    : setInternalOpen;

  React.useEffect(() => {
    if (isOpen) {
      setPending(selectedValues);
      setSearch("");
    }
  }, [isOpen, selectedValues]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, search]);

  function toggleItem(value: string) {
    setPending((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function handleSubmit() {
    onSelectedChange(pending);
    setIsOpen(false);
  }

  const hasSubmit = submitLabel !== undefined;

  function handleToggle(value: string) {
    if (hasSubmit) {
      toggleItem(value);
    } else {
      const next = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      onSelectedChange(next);
    }
  }

  const currentValues = hasSubmit ? pending : selectedValues;

  /* ── design별 팝오버 컨테이너 스타일 ── */
  const popoverClass = cn(
    "w-64 p-0 overflow-hidden",
    design === "bordered" && "rounded-xl border-2",
    design === "pill" && "rounded-2xl",
    design === "minimal" && "shadow-sm border-muted/60",
  );

  /* ── design별 검색 input 스타일 ── */
  const searchClass = cn(
    "placeholder:text-muted-foreground h-8 w-full bg-transparent text-sm outline-none",
    design === "pill"
      ? "rounded-full border px-4 pl-9"
      : design === "minimal"
        ? "border-b px-1 pb-2 pl-7"
        : "rounded-md border px-3 pl-8",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  );

  /* ── design별 아이템 행 스타일 ── */
  const itemClass = (checked: boolean) =>
    cn(
      "flex w-full cursor-pointer items-center gap-2.5 text-left transition-colors outline-none",
      design === "pill"
        ? "rounded-lg px-2.5 py-2 hover:bg-accent/60"
        : design === "minimal"
          ? cn("px-1 py-1.5 hover:bg-transparent", checked && "opacity-100", !checked && "opacity-60 hover:opacity-80")
          : design === "bordered"
            ? cn("rounded-md px-2 py-1.5 hover:bg-accent", checked && "bg-accent/40")
            : "rounded-md px-2 py-1.5 hover:bg-accent focus-visible:bg-accent",
    );

  /* ── design별 submit 버튼 스타일 ── */
  const submitClass = cn(
    "h-9 w-full cursor-pointer text-sm font-medium transition-colors",
    "bg-primary text-primary-foreground hover:bg-primary/90",
    design === "pill" ? "rounded-full" : "rounded-md",
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className={popoverClass} align="start">
        <div data-slot="multi-select-popover" className="flex flex-col">
          {/* 헤더 */}
          {title && (
            <div
              className={cn(
                "flex items-center justify-between px-3 pt-3 pb-2",
                design === "pill" && "px-4",
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold",
                  design === "pill" && "text-base",
                )}
              >
                {title}
              </span>
              {currentValues.length > 0 && (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
                  onClick={() => {
                    if (hasSubmit) setPending([]);
                    else onSelectedChange([]);
                  }}
                >
                  초기화
                </button>
              )}
            </div>
          )}

          {/* 검색 */}
          <div
            className={cn(
              "relative",
              design === "pill" ? "px-4 pb-2" : "px-3",
              !title && "pt-3",
              title ? "pb-2" : "pb-2",
            )}
          >
            <Search
              className={cn(
                "text-muted-foreground pointer-events-none absolute top-1/2 size-4 -translate-y-1/2",
                design === "pill" ? "left-6" : design === "minimal" ? "left-4" : "left-5",
              )}
            />
            <input
              data-slot="multi-select-search"
              className={searchClass}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-5 -translate-y-1/2 cursor-pointer"
                onClick={() => setSearch("")}
                aria-label="검색어 지우기"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* 리스트 */}
          <div
            className={cn(
              "overflow-y-auto",
              design === "pill" ? "max-h-52 px-2 pb-1" : "max-h-52 px-1 pb-1",
              design === "minimal" && "divide-border divide-y px-3",
            )}
          >
            {filtered.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-sm">
                {emptyMessage}
              </div>
            ) : (
              filtered.map((item) => {
                const checked = currentValues.includes(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    role="option"
                    aria-selected={checked}
                    className={itemClass(checked)}
                    onClick={() => handleToggle(item.value)}
                  >
                    <CheckIndicator checked={checked} design={design} />
                    <ItemLabel item={item} design={design} />
                  </button>
                );
              })
            )}
          </div>

          {/* 하단 버튼 */}
          {hasSubmit && (
            <div
              className={cn(
                "border-t px-3 py-2",
                design === "pill" && "px-4 py-3",
              )}
            >
              <button
                type="button"
                data-slot="multi-select-submit"
                className={submitClass}
                onClick={handleSubmit}
              >
                {submitLabel}
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelectPopover };
export type { MultiSelectPopoverProps, MultiSelectItem };
