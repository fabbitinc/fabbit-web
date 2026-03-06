import type { ReactNode } from "react";
import { cn } from "./lib/cn";

export interface InlineTabItem {
  key: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface InlineTabsProps {
  items: readonly InlineTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function InlineTabs({
  items,
  activeKey,
  onChange,
  className,
}: InlineTabsProps) {
  return (
    <div data-slot="inline-tabs" className={cn("flex gap-1 border-b border-border/70", className)}>
      {items.map((item) => {
        const isActive = activeKey === item.key;

        return (
          <button
            key={item.key}
            data-slot="inline-tabs-trigger"
            className={cn(
              "relative cursor-pointer px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              item.disabled && "pointer-events-none opacity-50",
            )}
            disabled={item.disabled}
            type="button"
            onClick={() => onChange(item.key)}
          >
            {item.label}
            {isActive ? (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
