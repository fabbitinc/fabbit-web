import { useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, MessageSquare, XCircle } from "lucide-react";
import {
  Badge,
  Button,
  ConfirmDialog,
  Input,
  TiptapEditor,
  type TiptapEditorProps,
  type TiptapMentionFetcher,
  UserAvatar,
} from "@fabbit/ui";
import { CommentInput } from "./comment-input";
import {
  DetailSelectionDialog,
  type DetailSelectionDialogProps as DetailSelectionDialogConfig,
} from "./detail-selection-dialog";
import { EditableTimelineComment } from "./editable-timeline-comment";
import {
  IssueSidebar,
  type IssueSidebarFile,
  type IssueSidebarLabel,
  type IssueSidebarLinkedChange,
  type IssueSidebarPart,
  type IssueSidebarUser,
} from "./issue-sidebar";
import { TimelineComment } from "./timeline-comment";
import { TimelineEventItem, type TimelineEventData } from "./timeline-event";

export interface IssueDetailScreenUser {
  id?: string | null;
  name: string;
  email?: string;
  profileImageUrl?: string | null;
}

export interface IssueDetailScreenLinkedIssue {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface IssueDetailScreenIssue {
  assignees: IssueSidebarUser[];
  attachments: IssueSidebarFile[];
  body: TiptapEditorProps["content"] | null;
  createdAt: string;
  createdBy: IssueDetailScreenUser | null;
  isModified?: boolean;
  labels: IssueSidebarLabel[];
  linkedChanges: IssueSidebarLinkedChange[];
  linkedIssues: IssueDetailScreenLinkedIssue[];
  number: number | string;
  relatedParts: IssueSidebarPart[];
  state: string;
  title: string;
}

export interface IssueDetailScreenCommentItem {
  kind: "comment";
  id: string;
  author: IssueDetailScreenUser | null;
  authorId?: string | null;
  body: TiptapEditorProps["content"] | null;
  isModified?: boolean;
  updatedAt: string;
}

export interface IssueDetailScreenEventItem {
  kind: "event";
  id: string;
  event: TimelineEventData;
}

export type IssueDetailScreenTimelineItem =
  | IssueDetailScreenCommentItem
  | IssueDetailScreenEventItem;

export interface IssueDetailScreenCurrentUser {
  id?: string | null;
  name?: string | null;
  profileImageUrl?: string | null;
}

export interface IssueDetailScreenDialog extends Omit<DetailSelectionDialogConfig, "open"> {}

export interface IssueDetailScreenProps {
  commentCount: number;
  currentUser?: IssueDetailScreenCurrentUser | null;
  dialog?: IssueDetailScreenDialog | null;
  isAttachingFiles?: boolean;
  isClosingIssue?: boolean;
  isCreatingComment?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isReopeningIssue?: boolean;
  isSavingIssue?: boolean;
  isTimelineLoading?: boolean;
  issue?: IssueDetailScreenIssue;
  mentionFetchers?: {
    issue?: TiptapMentionFetcher;
    user?: TiptapMentionFetcher;
  };
  onAttachFiles: (files: File[]) => Promise<void> | void;
  onBack: () => void;
  onCloseIssue: () => Promise<void> | void;
  onCreateComment: (body: TiptapEditorProps["content"] | null) => Promise<void>;
  onCreateLinkedChange: () => void;
  onDeleteComment: (commentId: string) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void> | void;
  onEditAssignees: () => void;
  onEditLabels: () => void;
  onEditLinkedChanges: () => void;
  onEditParts: () => void;
  onNavigateToChange: (changeNumber: number) => void;
  onNavigateToIssueMention: (issueNumber: number, issueType: "issue" | "change_request") => void;
  onReopenIssue: () => Promise<void> | void;
  onRetry?: () => void;
  onSaveIssue: (input: { body: TiptapEditorProps["content"] | null; title: string }) => Promise<void>;
  onUpdateComment: (commentId: string, body: TiptapEditorProps["content"] | null) => Promise<void>;
  timelineItems: IssueDetailScreenTimelineItem[];
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "방금";
  }

  if (minutes < 60) {
    return `${minutes}분 전`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}시간 전`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days}일 전`;
  }

  return formatDateTime(dateStr);
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function IssueStatusIcon({ state }: { state: string }) {
  const className = "h-4 w-4";

  return state === "OPEN" ? (
    <AlertCircle className={`${className} text-emerald-600 dark:text-emerald-400`} />
  ) : (
    <CheckCircle2 className={`${className} text-red-500 dark:text-red-400`} />
  );
}

const STATUS_BADGE_STYLE: Record<string, string> = {
  OPEN: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  CLOSED: "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400",
};

export function IssueDetailScreen({
  commentCount,
  currentUser,
  dialog,
  isAttachingFiles = false,
  isClosingIssue = false,
  isCreatingComment = false,
  isError = false,
  isLoading = false,
  isReopeningIssue = false,
  isSavingIssue = false,
  isTimelineLoading = false,
  issue,
  mentionFetchers,
  onAttachFiles,
  onBack,
  onCloseIssue,
  onCreateComment,
  onCreateLinkedChange,
  onDeleteComment,
  onDeleteFile,
  onEditAssignees,
  onEditLabels,
  onEditLinkedChanges,
  onEditParts,
  onNavigateToChange,
  onNavigateToIssueMention,
  onReopenIssue,
  onRetry,
  onSaveIssue,
  onUpdateComment,
  timelineItems,
}: IssueDetailScreenProps) {
  const [bodyDraft, setBodyDraft] = useState<TiptapEditorProps["content"] | null>(issue?.body ?? null);
  const [commentBody, setCommentBody] = useState<TiptapEditorProps["content"] | null>(null);
  const [commentEditorKey, setCommentEditorKey] = useState(0);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(issue?.title ?? "");

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">이슈를 불러오지 못했습니다.</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onBack}>
              목록으로
            </Button>
            {onRetry ? (
              <Button type="button" onClick={onRetry}>
                다시 시도
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const isOpen = issue.state === "OPEN";
  const createdByName = issue.createdBy?.name ?? "알 수 없음";

  const startEditing = () => {
    setTitleDraft(issue.title);
    setBodyDraft(issue.body);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setTitleDraft(issue.title);
    setBodyDraft(issue.body);
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-6">
      <button
        type="button"
        className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={onBack}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        이슈 목록
      </button>

      <div>
        <h2 className="text-xl font-bold text-foreground">
          {issue.title}
          <span className="ml-2 font-normal text-muted-foreground">#{issue.number}</span>
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={STATUS_BADGE_STYLE[issue.state] ?? ""}>
            <IssueStatusIcon state={issue.state} />
            {issue.state === "CLOSED" ? "닫힘" : "열림"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{createdByName}</span>
            {" 님이 "}
            {formatFullDate(issue.createdAt)}
            {" 에 열었습니다"}
          </span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            댓글 {commentCount}개
          </span>
        </div>
      </div>

      <div className="mt-6 flex gap-6">
        <div className="min-w-0 flex-1 space-y-4">
          {isEditing ? (
            <div className="flex gap-3">
              <UserAvatar
                imageUrl={issue.createdBy?.profileImageUrl ?? null}
                name={createdByName}
                className="h-8 w-8 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="issue-detail-title" className="text-sm font-medium text-foreground">
                    제목
                  </label>
                  <Input
                    id="issue-detail-title"
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">본문</label>
                  <TiptapEditor
                    content={bodyDraft ?? undefined}
                    placeholder="이슈 본문을 입력하세요"
                    minHeight={220}
                    userMentionFetcher={mentionFetchers?.user}
                    issueMentionFetcher={mentionFetchers?.issue}
                    onChangeJson={(content) => setBodyDraft(content)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={cancelEditing}>
                    취소
                  </Button>
                  <Button
                    disabled={!titleDraft.trim() || isSavingIssue}
                    type="button"
                    onClick={async () => {
                      try {
                        await onSaveIssue({ title: titleDraft, body: bodyDraft });
                        setIsEditing(false);
                      } catch {
                        return;
                      }
                    }}
                  >
                    {isSavingIssue ? <Loader2 className="size-4 animate-spin" /> : null}
                    저장
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <TimelineComment
              author={{
                name: createdByName,
                profileImageUrl: issue.createdBy?.profileImageUrl,
              }}
              createdAtLabel={timeAgo(issue.createdAt)}
              isModified={issue.isModified}
              showAuthorBadge
              onEdit={isOpen ? startEditing : undefined}
            >
              {issue.body ? (
                <div className="-mx-4 -my-3">
                  <TiptapEditor
                    editable={false}
                    hideToolbar
                    className="border-0 bg-transparent"
                    content={issue.body ?? undefined}
                    minHeight={0}
                    onIssueMentionClick={onNavigateToIssueMention}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">아직 입력된 본문이 없습니다.</p>
              )}
            </TimelineComment>
          )}

          {isTimelineLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">타임라인을 불러오는 중입니다.</div>
          ) : (
            timelineItems.map((item) =>
              item.kind === "comment" ? (
                <EditableTimelineComment
                  key={item.id}
                  author={{
                    name: item.author?.name ?? "알 수 없는 사용자",
                    profileImageUrl: item.author?.profileImageUrl,
                  }}
                  authorId={item.authorId}
                  body={item.body}
                  createdAtLabel={timeAgo(item.updatedAt)}
                  currentUserId={currentUser?.id ?? null}
                  isModified={item.isModified}
                  issueMentionFetcher={mentionFetchers?.issue}
                  onDelete={() => onDeleteComment(item.id)}
                  onNavigateToIssueMention={onNavigateToIssueMention}
                  onUpdate={(nextBody) => onUpdateComment(item.id, nextBody)}
                  userMentionFetcher={mentionFetchers?.user}
                />
              ) : (
                <TimelineEventItem key={item.id} event={item.event} onNavigate={onNavigateToIssueMention} />
              ),
            )
          )}

          <div className="border-t" />

          <CommentInput
            userName={currentUser?.name ?? undefined}
            userImageUrl={currentUser?.profileImageUrl ?? null}
            editor={
              <TiptapEditor
                key={commentEditorKey}
                placeholder="댓글을 작성하세요... @로 멤버, #로 이슈를 멘션할 수 있습니다."
                minHeight={100}
                userMentionFetcher={mentionFetchers?.user}
                issueMentionFetcher={mentionFetchers?.issue}
                onChangeJson={(content) => setCommentBody(content)}
              />
            }
            actions={
              <>
                {isOpen ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isClosingIssue}
                    onClick={() => setIsCloseConfirmOpen(true)}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    이슈 닫기
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isReopeningIssue}
                    onClick={() => {
                      void onReopenIssue();
                    }}
                  >
                    {isReopeningIssue ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    다시 열기
                  </Button>
                )}
                <Button
                  size="sm"
                  disabled={!commentBody || isCreatingComment}
                  onClick={async () => {
                    if (!commentBody) {
                      return;
                    }

                    await onCreateComment(commentBody);
                    setCommentBody(null);
                    setCommentEditorKey((previous) => previous + 1);
                  }}
                >
                  {isCreatingComment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  댓글
                </Button>
              </>
            }
          />
        </div>

        <div className="hidden w-70 shrink-0 lg:block">
          <IssueSidebar
            assignees={issue.assignees}
            labels={issue.labels}
            linkedChanges={issue.linkedChanges}
            linkedIssues={issue.linkedIssues}
            relatedParts={issue.relatedParts}
            attachments={issue.attachments}
            onEditAssignees={onEditAssignees}
            onEditLabels={onEditLabels}
            onEditParts={onEditParts}
            onEditLinkedChanges={onEditLinkedChanges}
            onNavigateToChange={onNavigateToChange}
            onCreateLinkedChange={onCreateLinkedChange}
            isAttachingFiles={isAttachingFiles}
            onAttachFiles={(files) => {
              void onAttachFiles(files);
            }}
            onDeleteFile={(fileId) => {
              void onDeleteFile(fileId);
            }}
          />
        </div>
      </div>

      {dialog ? <DetailSelectionDialog open {...dialog} /> : null}

      <ConfirmDialog
        open={isCloseConfirmOpen}
        title="이슈를 닫을까요?"
        description="닫힌 이슈는 다시 열 수 있지만, 현재 작업 흐름에서는 닫힘 상태로 집계됩니다."
        confirmLabel="이슈 닫기"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setIsCloseConfirmOpen(false)}
        onConfirm={() => {
          void onCloseIssue();
        }}
        onOpenChange={setIsCloseConfirmOpen}
      />
    </div>
  );
}
