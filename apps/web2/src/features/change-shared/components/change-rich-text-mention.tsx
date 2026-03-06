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
import { lookupIssues, lookupMembers } from "@/features/change-shared/api/change-shared.api";

interface MentionItem {
  id: string;
  label: string;
  profileImageUrl?: string | null;
  state?: string;
  number?: number;
  issueType?: "issue" | "change_request";
}

interface DropdownHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

type DropdownProps = SuggestionProps<MentionItem> & {
  variant: "user" | "issue";
};

const MentionDropdown = forwardRef<DropdownHandle, DropdownProps>(
  ({ items, command, variant }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const selected = container.children[selectedIndex] as HTMLElement | undefined;
      selected?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [command, items],
    );

    useImperativeHandle(ref, () => ({
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
      <div ref={containerRef} className="mention-dropdown">
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

function createSuggestion(
  variant: "user" | "issue",
): Omit<SuggestionOptions<MentionItem>, "editor"> {
  return {
    char: variant === "user" ? "@" : "#",
    items: async ({ query }) => {
      try {
        if (variant === "user") {
          const members = await lookupMembers({
            search: query || undefined,
            limit: 5,
          });

          return members.map((member) => ({
            id: member.userId,
            label: member.fullName,
            profileImageUrl: member.profileImageUrl,
          }));
        }

        const issues = await lookupIssues({
          search: query || undefined,
          limit: 5,
        });

        return issues.map((issue) => ({
          id: issue.id,
          label: issue.title,
          number: issue.number,
          state: issue.state,
          issueType: issue.type,
        }));
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
  if (!popup || !clientRect) {
    return;
  }

  const rect = typeof clientRect === "function" ? clientRect() : null;
  if (!rect) {
    return;
  }

  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
}

const IssueMentionExtension = Mention.extend({
  name: "issueMention",
  addAttributes() {
    return {
      ...this.parent?.(),
      number: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-number"),
        renderHTML: (attributes) => ({ "data-number": attributes.number }),
      },
      issueType: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-issue-type"),
        renderHTML: (attributes) => ({ "data-issue-type": attributes.issueType }),
      },
    };
  },
});

export function createMentionExtensions() {
  return [
    Mention.extend({ name: "userMention" }).configure({
      HTMLAttributes: { class: "mention-user" },
      suggestion: createSuggestion("user"),
    }),
    IssueMentionExtension.configure({
      HTMLAttributes: { class: "mention-issue" },
      suggestion: {
        ...createSuggestion("issue"),
        command: ({ editor, range, props: item }) => {
          const mentionItem = item as MentionItem;
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
