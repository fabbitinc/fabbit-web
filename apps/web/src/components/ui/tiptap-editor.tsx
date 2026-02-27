import { useEditor, EditorContent, type Content, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Minus,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── 툴바 버튼 ──────────────────────────────────────────────

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
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-30",
        isActive && "bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// ── 툴바 ───────────────────────────────────────────────────

function EditorToolbar({ editor }: { editor: Editor }) {
  const iconCls = "h-3.5 w-3.5";

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="굵게"
      >
        <Bold className={iconCls} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="기울임"
      >
        <Italic className={iconCls} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="취소선"
      >
        <Strikethrough className={iconCls} />
      </ToolbarButton>

      <div className="mx-1 h-4 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="제목"
      >
        <Heading2 className={iconCls} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="글머리 기호"
      >
        <List className={iconCls} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="번호 매기기"
      >
        <ListOrdered className={iconCls} />
      </ToolbarButton>

      <div className="mx-1 h-4 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="인용"
      >
        <Quote className={iconCls} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="구분선"
      >
        <Minus className={iconCls} />
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="실행 취소"
        >
          <Undo className={iconCls} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="다시 실행"
        >
          <Redo className={iconCls} />
        </ToolbarButton>
      </div>
    </div>
  );
}

// ── 메인 에디터 ────────────────────────────────────────────

export interface TiptapEditorProps {
  content?: Content;
  placeholder?: string;
  editable?: boolean;
  onChange?: (html: string) => void;
  onChangeJson?: (content: Content) => void;
  onChangeText?: (text: string) => void;
  className?: string;
  /** 툴바 숨기기 (읽기 전용 등) */
  hideToolbar?: boolean;
  /** 최소 높이 (px) */
  minHeight?: number;
}

export function TiptapEditor({
  content = "",
  placeholder = "내용을 입력하세요...",
  editable = true,
  onChange,
  onChangeJson,
  onChangeText,
  className,
  hideToolbar = false,
  minHeight = 120,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
      onChangeJson?.(e.getJSON());
      onChangeText?.(e.getText());
    },
  });

  if (!editor) return null;

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {editable && !hideToolbar && <EditorToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="tiptap-content"
        style={{ minHeight }}
      />
    </div>
  );
}
