import type { ReactNode } from "react";
import { UserAvatar } from "@fabbit/ui";

export interface CommentInputProps {
  /** 현재 사용자 이름 (아바타용) */
  userName?: string;
  /** 현재 사용자 프로필 이미지 */
  userImageUrl?: string | null;
  /** 에디터 영역 (TiptapEditor 등) */
  editor: ReactNode;
  /** 액션 버튼 영역 (닫기/댓글 버튼 등) */
  actions: ReactNode;
}

export function CommentInput({
  userName,
  userImageUrl,
  editor,
  actions,
}: CommentInputProps) {
  return (
    <div className="flex gap-3">
      {userName ? (
        <UserAvatar
          name={userName}
          imageUrl={userImageUrl}
          className="h-8 w-8 shrink-0"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          나
        </div>
      )}
      <div className="min-w-0 flex-1">
        {editor}
        <div className="mt-3 flex items-center justify-between">
          <div />
          <div className="flex gap-2">{actions}</div>
        </div>
      </div>
    </div>
  );
}
