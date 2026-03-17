import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ReactRenderer } from "@tiptap/react";
import Mention from "@tiptap/extension-mention";
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";

// ── 타입 ────────────────────────────────────────────────────

export interface TiptapMentionItem {
  id: string;
  label: string;
  profileImageUrl?: string | null;
  state?: string;
  number?: number;
  issueType?: "issue" | "engineering_change";
}

interface DropdownHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

type DropdownProps = SuggestionProps<TiptapMentionItem> & {
  variant: "user" | "issue";
};

export type TiptapMentionFetcher = (query: string, limit: number) => Promise<TiptapMentionItem[]>;

// ── 드롭다운 컴포넌트 ──────────────────────────────────────

const MentionDropdown = forwardRef<DropdownHandle, DropdownProps>(
  ({ items, command, variant }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const selected = container.children[selectedIndex] as HTMLElement | undefined;
      selected?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) command(item);
      },
      [items, command],
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="mention-dropdown">
          <div className="mention-dropdown-empty">검색 결과 없음</div>
        </div>
      );
    }

    return (
      <div className="mention-dropdown" ref={containerRef}>
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`mention-dropdown-item ${index === selectedIndex ? "is-selected" : ""}`}
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
                <span className="font-mono text-muted-foreground">
                  #{item.number}
                </span>
                <span className="truncate">{item.label}</span>
                <span className="ml-auto flex shrink-0 items-center gap-1.5">
                  {item.issueType && (
                    <span className="text-[10px] text-muted-foreground">
                      {item.issueType === "issue" ? "이슈" : "변경관리"}
                    </span>
                  )}
                  {item.state && (
                    <span className="text-[10px] text-muted-foreground">
                      {item.state}
                    </span>
                  )}
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

// ── Suggestion 팩토리 ─────────────────────────────────────

function createSuggestion(
  variant: "user" | "issue",
  fetcher: TiptapMentionFetcher,
): Omit<SuggestionOptions<TiptapMentionItem>, "editor"> {
  return {
    char: variant === "user" ? "@" : "#",

    items: async ({ query }) => {
      try {
        return await fetcher(query, 5);
      } catch {
        return [];
      }
    },

    render: () => {
      let renderer: ReactRenderer<DropdownHandle>;
      let popup: HTMLDivElement | null = null;

      return {
        onStart: (props) => {
          renderer = new ReactRenderer(MentionDropdown, {
            props: { ...props, variant },
            editor: props.editor,
          });

          popup = document.createElement("div");
          popup.style.position = "absolute";
          popup.style.zIndex = "50";
          document.body.appendChild(popup);
          popup.appendChild(renderer.element);

          updatePosition(props.clientRect, popup);
        },

        onUpdate: (props) => {
          renderer.updateProps({ ...props, variant });
          updatePosition(props.clientRect, popup);
        },

        onKeyDown: (props) => {
          if (props.event.key === "Escape") {
            popup?.remove();
            renderer?.destroy();
            return true;
          }
          return renderer?.ref?.onKeyDown(props) ?? false;
        },

        onExit: () => {
          popup?.remove();
          renderer?.destroy();
        },
      };
    },
  };
}

function updatePosition(
  clientRect: (() => DOMRect | null) | null | undefined,
  popup: HTMLDivElement | null,
) {
  if (!popup || !clientRect) return;
  const rect = typeof clientRect === "function" ? clientRect() : null;
  if (!rect) return;

  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
}

// ── issueMention 확장 (number 속성 추가) ─────────────────

const IssueMentionExtension = Mention.extend({
  name: "issueMention",
  addAttributes() {
    return {
      ...this.parent?.(),
      number: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-number"),
        renderHTML: (attrs) => ({ "data-number": attrs.number }),
      },
      issueType: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-issue-type"),
        renderHTML: (attrs) => ({ "data-issue-type": attrs.issueType }),
      },
    };
  },
});

// ── 확장 생성 함수 ───────────────────────────────────────

export function createMentionExtensions(
  userFetcher: TiptapMentionFetcher,
  issueFetcher: TiptapMentionFetcher,
) {
  return [
    Mention.extend({ name: "userMention" }).configure({
      HTMLAttributes: { class: "mention-user" },
      suggestion: createSuggestion("user", userFetcher),
    }),
    IssueMentionExtension.configure({
      HTMLAttributes: { class: "mention-issue" },
      suggestion: {
        ...createSuggestion("issue", issueFetcher),
        command: ({ editor, range, props: item }) => {
          const mentionItem = item as unknown as TiptapMentionItem;
          const nodeAfter = editor.view.state.selection.$to.nodeAfter;
          const overrideSpace = nodeAfter?.text?.startsWith(" ");

          if (overrideSpace) {
            range.to += 1;
          }

          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: "issueMention",
                attrs: {
                  id: mentionItem.id,
                  label: `${mentionItem.number} ${mentionItem.label}`,
                  number: mentionItem.number,
                  issueType: mentionItem.issueType ?? null,
                },
              },
              { type: "text", text: " " },
            ])
            .run();

          window.getSelection()?.collapseToEnd();
        },
      },
    }),
  ];
}

export const staticMentionExtensions = [
  Mention.extend({ name: "userMention" }).configure({
    HTMLAttributes: { class: "mention-user" },
  }),
  IssueMentionExtension.configure({
    HTMLAttributes: { class: "mention-issue" },
    suggestion: { char: "#" },
  }),
];
