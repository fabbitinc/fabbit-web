import { ReactRenderer } from "@tiptap/react";
import Mention from "@tiptap/extension-mention";
import type { SuggestionOptions } from "@tiptap/suggestion";
import {
  MentionDropdown,
  type MentionDropdownHandle,
  type MentionItem,
} from "@/features/change-shared/components/change-rich-text-mention-dropdown";
import type { ChangeRichTextMentionLookup } from "@/features/change-shared/types/change-rich-text-mention";

function createSuggestion(
  variant: "user" | "issue",
  mentionLookup: ChangeRichTextMentionLookup,
): Omit<SuggestionOptions<MentionItem>, "editor"> {
  return {
    char: variant === "user" ? "@" : "#",
    items: async ({ query }) => {
      try {
        if (variant === "user") {
          return mentionLookup.lookupMembers(query);
        }

        return mentionLookup.lookupIssues(query);
      } catch {
        return [];
      }
    },
    render: () => {
      let renderer: ReactRenderer<MentionDropdownHandle>;
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

export function createMentionExtensions(mentionLookup: ChangeRichTextMentionLookup) {
  return [
    Mention.extend({ name: "userMention" }).configure({
      HTMLAttributes: { class: "mention-user" },
      suggestion: createSuggestion("user", mentionLookup),
    }),
    IssueMentionExtension.configure({
      HTMLAttributes: { class: "mention-issue" },
      suggestion: {
        ...createSuggestion("issue", mentionLookup),
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
