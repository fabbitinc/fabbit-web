import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Badge, Button, UserAvatar } from "@fabbit/ui";

export interface TimelineCommentAuthor {
  name: string;
  profileImageUrl?: string | null;
}

export interface TimelineCommentProps {
  author: TimelineCommentAuthor;
  createdAtLabel: string;
  isModified?: boolean;
  /** 작성자 배지 표시 여부 */
  showAuthorBadge?: boolean;
  /** 편집 버튼 클릭 */
  onEdit?: () => void;
  /** 댓글 본문 (string 또는 커스텀 ReactNode) */
  children: ReactNode;
}

export function TimelineComment({
  author,
  createdAtLabel,
  isModified,
  showAuthorBadge,
  onEdit,
  children,
}: TimelineCommentProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <UserAvatar
          name={author.name}
          imageUrl={author.profileImageUrl}
          className="h-8 w-8 shrink-0"
        />
      </div>
      <div className="min-w-0 flex-1 rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
          <span className="text-sm font-medium text-foreground">
            {author.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {createdAtLabel}
          </span>
          {isModified && (
            <span className="text-xs text-muted-foreground">· 수정됨</span>
          )}
          {showAuthorBadge && (
            <Badge variant="outline" className="ml-auto text-[10px]">
              작성자
            </Badge>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 shrink-0 ${showAuthorBadge ? "" : "ml-auto"}`}
              onClick={onEdit}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="px-4 py-3 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
