import { useMemo, useState } from "react";
import { History, Loader2, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Badge, Button, ConfirmDialog, TiptapEditor, type TiptapMentionFetcher, UserAvatar } from "@fabbit/ui";
import { useTiptapMentionFetchers } from "@/features/change-shared/hooks/use-tiptap-mention-fetchers";
import type { IssueTimelineCommentModel, IssueTimelineItemModel } from "@/features/issue/types/issue-model";
import { normalizeRichTextDocument, type RichTextDocument } from "@/lib/rich-text";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getActivityLabel(action: string) {
  const actionLabelMap: Record<string, string> = {
    "issue:created": "이슈가 생성되었습니다.",
    "issue:title_changed": "제목이 변경되었습니다.",
    "issue:state_changed": "상태가 변경되었습니다.",
    "issue:assignee_changed": "담당자가 변경되었습니다.",
    "issue:label_changed": "라벨이 변경되었습니다.",
    "issue:part_changed": "관련 부품이 변경되었습니다.",
    "issue:file_attached": "첨부파일이 추가되었습니다.",
    "issue:file_detached": "첨부파일이 제거되었습니다.",
    "issue:cr_changed": "연결된 변경 요청이 변경되었습니다.",
    "issue:closed": "이슈가 닫혔습니다.",
    "issue:reopened": "이슈가 다시 열렸습니다.",
    "issue:mentioned": "멘션이 추가되었습니다.",
  };

  return actionLabelMap[action] ?? action;
}

interface TimelineCommentItemProps {
  item: IssueTimelineCommentModel;
  currentUserId: string | null;
  issueMentionFetcher: TiptapMentionFetcher;
  onDeleteComment: (commentId: string) => Promise<void>;
  onNavigateToIssueMention: (issueNumber: number, issueType: "issue" | "change_request") => void;
  onUpdateComment: (commentId: string, body: RichTextDocument) => Promise<void>;
  userMentionFetcher: TiptapMentionFetcher;
}

function TimelineCommentItem({
  item,
  currentUserId,
  issueMentionFetcher,
  onDeleteComment,
  onNavigateToIssueMention,
  onUpdateComment,
  userMentionFetcher,
}: TimelineCommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState<RichTextDocument | null>(normalizeRichTextDocument(item.body));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = currentUserId != null && currentUserId === item.authorId;

  return (
    <>
      <div className="rounded-lg border border-border/70 bg-card px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar imageUrl={item.author?.profileImageUrl ?? null} name={item.author?.fullName ?? "알 수 없는 사용자"} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium text-foreground">{item.author?.fullName ?? "알 수 없는 사용자"}</p>
                {item.isModified ? <Badge variant="outline">수정됨</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">{formatDateTime(item.updatedAt)}</p>
            </div>
          </div>

          {canEdit ? (
            <div className="flex items-center gap-1">
              <Button size="icon-sm" type="button" variant="ghost" onClick={() => setIsEditing((current) => !current)}>
                <Pencil className="size-4" />
              </Button>
              <Button size="icon-sm" type="button" variant="ghost" onClick={() => setIsDeleting(true)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>

        {isEditing ? (
          <div className="mt-4 space-y-3">
            <TiptapEditor
              content={body ?? undefined}
              placeholder="댓글을 수정하세요"
              minHeight={120}
              issueMentionFetcher={issueMentionFetcher}
              onChangeJson={(content) => setBody(normalizeRichTextDocument(content))}
              userMentionFetcher={userMentionFetcher}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setBody(normalizeRichTextDocument(item.body));
                  setIsEditing(false);
                }}
              >
                취소
              </Button>
              <Button
                disabled={!body || isSaving}
                type="button"
                onClick={async () => {
                  if (!body) {
                    return;
                  }

                  setIsSaving(true);

                  try {
                    await onUpdateComment(item.id, body);
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
        ) : (
          <div className="mt-4">
            <TiptapEditor
              editable={false}
              hideToolbar
              className="border-0 bg-transparent"
              content={item.body ?? undefined}
              minHeight={0}
              onIssueMentionClick={onNavigateToIssueMention}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isDeleting}
        title="댓글을 삭제할까요?"
        description="삭제한 댓글은 복구할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setIsDeleting(false)}
        onConfirm={() => {
          void onDeleteComment(item.id);
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

interface IssueTimelineSectionProps {
  currentUserId: string | null;
  isLoading: boolean;
  items: IssueTimelineItemModel[];
  onCreateComment: (body: RichTextDocument) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onNavigateToIssueMention: (issueNumber: number, issueType: "issue" | "change_request") => void;
  onUpdateComment: (commentId: string, body: RichTextDocument) => Promise<void>;
}

export function IssueTimelineSection({
  currentUserId,
  isLoading,
  items,
  onCreateComment,
  onDeleteComment,
  onNavigateToIssueMention,
  onUpdateComment,
}: IssueTimelineSectionProps) {
  const [body, setBody] = useState<RichTextDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userMentionFetcher, issueMentionFetcher } = useTiptapMentionFetchers();
  const sortedItems = useMemo(
    () => [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [items],
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-foreground">대화 및 활동</p>
          <p className="mt-1 text-sm text-muted-foreground">댓글과 변경 이력을 시간순으로 확인합니다.</p>
        </div>
        <Badge variant="outline">{items.length}개 항목</Badge>
      </div>

      <section className="app-panel rounded-lg p-5">
        <div className="space-y-3">
          <TiptapEditor
            content={body ?? undefined}
            placeholder="댓글을 입력하세요. @로 멤버, #로 이슈/변경 요청을 멘션할 수 있습니다."
            minHeight={140}
            issueMentionFetcher={issueMentionFetcher}
            onChangeJson={(content) => setBody(normalizeRichTextDocument(content))}
            userMentionFetcher={userMentionFetcher}
          />
          <div className="flex justify-end">
            <Button
              disabled={!body || isSubmitting}
              type="button"
              onClick={async () => {
                if (!body) {
                  return;
                }

                setIsSubmitting(true);

                try {
                  await onCreateComment(body);
                  setBody(null);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
              댓글 등록
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {isLoading ? (
          <div className="rounded-lg border border-border/70 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            타임라인을 불러오는 중입니다.
          </div>
        ) : null}

        {!isLoading && sortedItems.length === 0 ? (
          <div className="rounded-lg border border-border/70 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            아직 기록된 댓글이나 활동이 없습니다.
          </div>
        ) : null}

        {sortedItems.map((item) =>
          item.type === "comment" ? (
            <TimelineCommentItem
              key={item.id}
              item={item}
              currentUserId={currentUserId}
              issueMentionFetcher={issueMentionFetcher}
              onDeleteComment={onDeleteComment}
              onNavigateToIssueMention={onNavigateToIssueMention}
              onUpdateComment={onUpdateComment}
              userMentionFetcher={userMentionFetcher}
            />
          ) : (
            <div key={item.id} className="rounded-lg border border-border/70 bg-card px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <History className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.actor ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar imageUrl={item.actor.profileImageUrl} name={item.actor.fullName} />
                        <span className="font-medium text-foreground">{item.actor.fullName}</span>
                      </div>
                    ) : (
                      <span className="font-medium text-foreground">알 수 없는 사용자</span>
                    )}
                    <span className="text-sm text-muted-foreground">{getActivityLabel(item.action)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                </div>
              </div>
            </div>
          ),
        )}
      </section>
    </section>
  );
}
