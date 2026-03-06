import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { SuggestionProps } from "@tiptap/suggestion";
import type { ChangeRichTextMentionItem } from "@/features/change-shared/types/change-rich-text-mention";

export interface MentionDropdownHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface MentionDropdownProps extends SuggestionProps<ChangeRichTextMentionItem> {
  variant: "user" | "issue";
}

export const MentionDropdown = forwardRef<MentionDropdownHandle, MentionDropdownProps>(
  ({ items, command, variant }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const resolvedSelectedIndex = items.length === 0 ? 0 : Math.min(selectedIndex, items.length - 1);

    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const selected = container.children[resolvedSelectedIndex] as HTMLElement | undefined;
      selected?.scrollIntoView({ block: "nearest" });
    }, [resolvedSelectedIndex]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [command, items],
    );

    useImperativeHandle(
      ref,
      () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
          if (items.length === 0) {
            return false;
          }

          if (event.key === "ArrowUp") {
            setSelectedIndex((previous) => (previous + items.length - 1) % items.length);
            return true;
          }

          if (event.key === "ArrowDown") {
            setSelectedIndex((previous) => (previous + 1) % items.length);
            return true;
          }

          if (event.key === "Enter") {
            selectItem(resolvedSelectedIndex);
            return true;
          }

          return false;
        },
      }),
      [items.length, resolvedSelectedIndex, selectItem],
    );

    if (items.length === 0) {
      return (
        <div className="mention-dropdown">
          <div className="mention-dropdown-empty">검색 결과 없음</div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className="mention-dropdown">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`mention-dropdown-item ${index === resolvedSelectedIndex ? "is-selected" : ""}`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            {variant === "user" ? (
              <div className="flex items-center gap-2">
                {item.profileImageUrl ? (
                  <img
                    src={item.profileImageUrl}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    {item.label.slice(0, 1)}
                  </span>
                )}
                <span className="truncate text-sm">{item.label}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-muted-foreground">#{item.number}</span>
                <span className="truncate">{item.label}</span>
                <span className="ml-auto flex shrink-0 items-center gap-1.5">
                  {item.issueType ? (
                    <span className="text-[10px] text-muted-foreground">
                      {item.issueType === "issue" ? "이슈" : "변경 요청"}
                    </span>
                  ) : null}
                  {item.state ? <span className="text-[10px] text-muted-foreground">{item.state}</span> : null}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    );
  },
);

MentionDropdown.displayName = "MentionDropdown";

export type { ChangeRichTextMentionItem as MentionItem };
