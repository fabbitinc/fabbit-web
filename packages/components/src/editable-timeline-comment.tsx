import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  Button,
  ConfirmDialog,
  TiptapEditor,
  type TiptapEditorProps,
  type TiptapMentionFetcher,
  UserAvatar,
} from "@fabbit/ui";
import { TimelineComment, type TimelineCommentAuthor } from "./timeline-comment";

export interface EditableTimelineCommentProps {
  author: TimelineCommentAuthor;
  authorId?: string | null;
  body: TiptapEditorProps["content"] | null;
  createdAtLabel: string;
  currentUserId?: string | null;
  editPlaceholder?: string;
  isModified?: boolean;
  issueMentionFetcher?: TiptapMentionFetcher;
  onDelete: () => Promise<void> | void;
  onNavigateToIssueMention?: (issueNumber: number, issueType: "issue" | "change_request") => void;
  onUpdate: (body: TiptapEditorProps["content"] | null) => Promise<void>;
  userMentionFetcher?: TiptapMentionFetcher;
}

export function EditableTimelineComment({
  author,
  authorId,
  body,
  createdAtLabel,
  currentUserId,
  editPlaceholder = "댓글을 수정하세요",
  isModified,
  issueMentionFetcher,
  onDelete,
  onNavigateToIssueMention,
  onUpdate,
  userMentionFetcher,
}: EditableTimelineCommentProps) {
  const [bodyDraft, setBodyDraft] = useState<TiptapEditorProps["content"] | null>(body);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = Boolean(currentUserId && authorId && currentUserId === authorId);

  if (isEditing) {
    return (
      <div className="flex gap-3">
        <UserAvatar
          imageUrl={author.profileImageUrl ?? null}
          name={author.name}
          className="h-8 w-8 shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <TiptapEditor
            content={bodyDraft ?? undefined}
            placeholder={editPlaceholder}
            minHeight={120}
            userMentionFetcher={userMentionFetcher}
            issueMentionFetcher={issueMentionFetcher}
            onChangeJson={(content) => setBodyDraft(content)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBodyDraft(body);
                setIsEditing(false);
              }}
            >
              취소
            </Button>
            <Button
              disabled={!bodyDraft || isSaving}
              type="button"
              onClick={async () => {
                if (!bodyDraft) {
                  return;
                }

                setIsSaving(true);

                try {
                  await onUpdate(bodyDraft);
                  setIsEditing(false);
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              저장
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TimelineComment
        author={author}
        createdAtLabel={createdAtLabel}
        isModified={isModified}
        onEdit={
          canEdit
            ? () => {
                setBodyDraft(body);
                setIsEditing(true);
              }
            : undefined
        }
      >
        <div className="-mx-4 -my-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <TiptapEditor
                editable={false}
                hideToolbar
                className="border-0 bg-transparent"
                content={body ?? undefined}
                minHeight={0}
                onIssueMentionClick={onNavigateToIssueMention}
              />
            </div>
            {canEdit ? (
              <Button
                size="icon"
                type="button"
                variant="ghost"
                className="mt-2 mr-2 h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            ) : null}
          </div>
        </div>
      </TimelineComment>

      <ConfirmDialog
        open={isDeleting}
        title="댓글을 삭제할까요?"
        description="삭제한 댓글은 복구할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setIsDeleting(false)}
        onConfirm={() => {
          void onDelete();
        }}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleting(false);
          }
        }}
      />
    </>
  );
}
