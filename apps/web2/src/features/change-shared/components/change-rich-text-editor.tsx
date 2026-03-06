import { useCallback, useEffect, useMemo, useRef } from "react";
import { useEditor, EditorContent, type Content, type Editor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";
import { createMentionExtensions, staticMentionExtensions } from "@/features/change-shared/components/change-rich-text-mention";
import { useChangeRichTextMentionLogic } from "@/features/change-shared/hooks/use-change-rich-text-mention-logic";
import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-30",
        isActive && "bg-muted text-foreground",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const iconClassName = "h-3.5 w-3.5";

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1">
      <ToolbarButton
        title="굵게"
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className={iconClassName} />
      </ToolbarButton>
      <ToolbarButton
        title="기울임"
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className={iconClassName} />
      </ToolbarButton>
      <ToolbarButton
        title="취소선"
        isActive={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className={iconClassName} />
      </ToolbarButton>

      <div className="mx-1 h-4 w-px bg-border" />

      <ToolbarButton
        title="제목"
        isActive={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className={iconClassName} />
      </ToolbarButton>
      <ToolbarButton
        title="글머리 기호"
        isActive={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className={iconClassName} />
      </ToolbarButton>
      <ToolbarButton
        title="번호 매기기"
        isActive={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className={iconClassName} />
      </ToolbarButton>

      <div className="mx-1 h-4 w-px bg-border" />

      <ToolbarButton
        title="인용"
        isActive={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className={iconClassName} />
      </ToolbarButton>
      <ToolbarButton title="구분선" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className={iconClassName} />
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton
          title="실행 취소"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className={iconClassName} />
        </ToolbarButton>
        <ToolbarButton
          title="다시 실행"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className={iconClassName} />
        </ToolbarButton>
      </div>
    </div>
  );
}

export interface ChangeRichTextEditorProps {
  content?: Content;
  placeholder?: string;
  editable?: boolean;
  hideToolbar?: boolean;
  minHeight?: number;
  className?: string;
  onChange?: (html: string) => void;
  onChangeJson?: (content: Content) => void;
  onChangeText?: (text: string) => void;
  onIssueMentionClick?: (issueNumber: number, issueType: "issue" | "change_request") => void;
}

export function ChangeRichTextEditor({
  content = "",
  placeholder = "내용을 입력하세요...",
  editable = true,
  hideToolbar = false,
  minHeight = 120,
  className,
  onChange,
  onChangeJson,
  onChangeText,
  onIssueMentionClick,
}: ChangeRichTextEditorProps) {
  const mentionLookup = useChangeRichTextMentionLogic();
  const mentionExtensions = useMemo(
    () => (editable ? createMentionExtensions(mentionLookup) : staticMentionExtensions),
    [editable, mentionLookup],
  );

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder }), ...mentionExtensions],
    content,
    editable,
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML());
      onChangeJson?.(currentEditor.getJSON());
      onChangeText?.(currentEditor.getText());
    },
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (editor && !editable) {
      editor.commands.setContent(content);
    }
  }, [content, editable, editor]);

  const handleEditorClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!onIssueMentionClick) {
        return;
      }

      const target = event.target as HTMLElement;
      const mentionElement = target.closest("[data-type='issueMention']") as HTMLElement | null;

      if (!mentionElement) {
        return;
      }

      const rawType = mentionElement.getAttribute("data-issue-type");
      const issueType: "issue" | "change_request" = rawType === "change_request" ? "change_request" : "issue";
      const rawNumber = mentionElement.getAttribute("data-number");

      if (rawNumber) {
        event.preventDefault();
        onIssueMentionClick(Number(rawNumber), issueType);
        return;
      }

      const label = mentionElement.getAttribute("data-label") ?? mentionElement.textContent ?? "";
      const match = label.match(/^#?(\\d+)/);

      if (match) {
        event.preventDefault();
        onIssueMentionClick(Number(match[1]), issueType);
      }
    },
    [onIssueMentionClick],
  );

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {editable && !hideToolbar ? <EditorToolbar editor={editor} /> : null}
      <div onClick={handleEditorClick}>
        <EditorContent
          editor={editor}
          className="tiptap-content"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}
