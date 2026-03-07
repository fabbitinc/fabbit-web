import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, MessageSquare, Pencil, XCircle } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  ConfirmDialog,
  Input,
  TiptapEditor,
  type TiptapEditorProps,
  type TiptapMentionFetcher,
  UserAvatar,
} from "@fabbit/ui";
import {
  IssueSidebar,
  type IssueSidebarFile,
  type IssueSidebarLabel,
  type IssueSidebarLinkedChange,
  type IssueSidebarPart,
  type IssueSidebarUser,
} from "./issue-sidebar";
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
  createdAt: string;
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

export interface IssueDetailScreenProps {
  availableChanges?: { id: string; number: number; title: string; state: string }[];
  availableLabels?: { id: string; name: string; colorHex: string }[];
  availableMembers?: { id: string; name: string; email: string }[];
  commentCount: number;
  currentUser?: IssueDetailScreenCurrentUser | null;
  isAttachingFiles?: boolean;
  isChangesSearching?: boolean;
  isClosingIssue?: boolean;
  isCreatingComment?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isMetaUpdating?: boolean;
  isNotFound?: boolean;
  isPartsSearching?: boolean;
  isReopeningIssue?: boolean;
  isSavingIssue?: boolean;
  isTimelineLoading?: boolean;
  issue?: IssueDetailScreenIssue;
  linkedChangeIds?: string[];
  mentionFetchers?: {
    issue?: TiptapMentionFetcher;
    user?: TiptapMentionFetcher;
  };
  onAttachFiles: (files: File[]) => Promise<void> | void;
  onBack: () => void;
  onChangeSearchChange?: (search: string) => void;
  onCloseIssue: () => Promise<void> | void;
  onCreateComment: (body: TiptapEditorProps["content"] | null) => Promise<void>;
  onCreateLinkedChange: () => void;
  onDeleteComment: (commentId: string) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void> | void;
  onNavigateToChange: (changeNumber: number) => void;
  onNavigateToIssueMention: (issueNumber: number, issueType: "issue" | "change_request") => void;
  onNavigateToPart?: (partId: string) => void;
  onPartsSearchChange?: (search: string) => void;
  onReopenIssue: () => Promise<void> | void;
  onRequestChanges?: () => void;
  onRequestLabels?: () => void;
  onRequestMembers?: () => void;
  onRequestParts?: () => void;
  onRetry?: () => void;
  onSaveIssue: (input: { body: TiptapEditorProps["content"] | null; title: string }) => Promise<void>;
  onSyncAssignees?: (userIds: string[]) => void;
  onSyncLabels?: (labelIds: string[]) => void;
  onSyncLinkedChanges?: (changeIds: string[]) => void;
  onSyncParts?: (partIds: string[]) => void;
  onUpdateComment: (commentId: string, body: TiptapEditorProps["content"] | null) => Promise<void>;
  searchedParts?: { id: string; partNumber: string; name: string | null }[];
  selectedAssigneeIds?: string[];
  selectedLabelIds?: string[];
  selectedPartIds?: string[];
  timelineItems: IssueDetailScreenTimelineItem[];
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

  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
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

function IssueTimelineCommentItem({
  comment,
  canEdit,
  issueMentionFetcher,
  onNavigateToIssueMention,
  onUpdate,
  userMentionFetcher,
}: {
  comment: IssueDetailScreenCommentItem;
  canEdit: boolean;
  issueMentionFetcher?: TiptapMentionFetcher;
  onNavigateToIssueMention: (issueNumber: number, issueType: "issue" | "change_request") => void;
  onUpdate: (commentId: string, body: TiptapEditorProps["content"] | null) => Promise<void>;
  userMentionFetcher?: TiptapMentionFetcher;
}) {
  const [bodyDraft, setBodyDraft] = useState<TiptapEditorProps["content"] | null>(comment.body);
  const [editorKey, setEditorKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (isEditing) {
    return (
      <div>
        <TiptapEditor
          key={editorKey}
          content={bodyDraft ?? undefined}
          editable
          minHeight={80}
          userMentionFetcher={userMentionFetcher}
          issueMentionFetcher={issueMentionFetcher}
          onChangeJson={(content) => setBodyDraft(content)}
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBodyDraft(comment.body);
              setIsEditing(false);
            }}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            size="sm"
            disabled={!bodyDraft || isSaving}
            onClick={async () => {
              if (!bodyDraft) {
                return;
              }

              setIsSaving(true);

              try {
                await onUpdate(comment.id, bodyDraft);
                setIsEditing(false);
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            저장
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <UserAvatar
          name={comment.author?.name ?? "알 수 없는 사용자"}
          imageUrl={comment.author?.profileImageUrl}
          className="h-8 w-8 shrink-0"
        />
      </div>
      <div className="min-w-0 flex-1 rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
          <span className="text-sm font-medium text-foreground">
            {comment.author?.name ?? "알 수 없는 사용자"}
          </span>
          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          {comment.isModified ? <span className="text-xs text-muted-foreground">· 수정됨</span> : null}
          {canEdit ? (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-6 w-6 shrink-0"
              onClick={() => {
                setBodyDraft(comment.body);
                setEditorKey((previous) => previous + 1);
                setIsEditing(true);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
        <div className="px-4 py-3">
          <TiptapEditor
            content={comment.body ?? undefined}
            editable={false}
            hideToolbar
            minHeight={0}
            className="border-0 bg-transparent"
            onIssueMentionClick={onNavigateToIssueMention}
          />
        </div>
      </div>
    </div>
  );
}

export function IssueDetailScreen({
  availableChanges = [],
  availableLabels = [],
  availableMembers = [],
  commentCount,
  currentUser,
  isAttachingFiles = false,
  isChangesSearching = false,
  isClosingIssue = false,
  isCreatingComment = false,
  isError = false,
  isLoading = false,
  isMetaUpdating = false,
  isNotFound = false,
  isPartsSearching = false,
  isReopeningIssue = false,
  isSavingIssue = false,
  isTimelineLoading = false,
  issue,
  linkedChangeIds = [],
  mentionFetchers,
  onAttachFiles,
  onBack,
  onChangeSearchChange,
  onCloseIssue,
  onCreateComment,
  onCreateLinkedChange,
  onDeleteComment: _onDeleteComment,
  onDeleteFile,
  onNavigateToChange,
  onNavigateToIssueMention,
  onNavigateToPart,
  onPartsSearchChange,
  onReopenIssue,
  onRequestChanges,
  onRequestLabels,
  onRequestMembers,
  onRequestParts,
  onRetry,
  onSaveIssue,
  onSyncAssignees,
  onSyncLabels,
  onSyncLinkedChanges,
  onSyncParts,
  onUpdateComment,
  searchedParts = [],
  selectedAssigneeIds = [],
  selectedLabelIds = [],
  selectedPartIds = [],
  timelineItems,
}: IssueDetailScreenProps) {
  const [bodyDraft, setBodyDraft] = useState<TiptapEditorProps["content"] | null>(issue?.body ?? null);
  const [commentBody, setCommentBody] = useState<TiptapEditorProps["content"] | null>(null);
  const [commentEditorKey, setCommentEditorKey] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(issue?.title ?? "");

  useEffect(() => {
    setBodyDraft(issue?.body ?? null);
    setTitleDraft(issue?.title ?? "");
    setIsEditing(false);
  }, [issue?.number]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
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

  if (isNotFound || !issue) {
    return <p className="py-8 text-center text-sm text-muted-foreground">이슈를 찾을 수 없습니다.</p>;
  }

  const isOpen = issue.state === "OPEN";
  const createdByName = issue.createdBy?.name ?? "알 수 없음";
  const startEditing = () => {
    setTitleDraft(issue.title);
    setBodyDraft(issue.body);
    setIsEditing(true);
  };

  return (
    <div className="mx-auto max-w-[1160px]">
      <button
        type="button"
        className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={onBack}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        이슈 목록
      </button>

      <div>
        {isEditing ? (
          <Input
            id="issue-detail-title"
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            className="text-xl font-bold"
            autoFocus
          />
        ) : (
          <h2 className="text-xl font-bold text-foreground">
            {issue.title}
            <span className="ml-2 font-normal text-muted-foreground">#{issue.number}</span>
          </h2>
        )}
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
            <div>
              <TiptapEditor
                content={bodyDraft ?? undefined}
                placeholder="이슈 본문을 입력하세요"
                minHeight={100}
                userMentionFetcher={mentionFetchers?.user}
                issueMentionFetcher={mentionFetchers?.issue}
                onChangeJson={(content) => setBodyDraft(content)}
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTitleDraft(issue.title);
                    setBodyDraft(issue.body);
                    setIsEditing(false);
                  }}
                  disabled={isSavingIssue}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  disabled={!titleDraft.trim() || isSavingIssue}
                  onClick={async () => {
                    try {
                      await onSaveIssue({ title: titleDraft.trim(), body: bodyDraft });
                      setIsEditing(false);
                    } catch {
                      return;
                    }
                  }}
                >
                  {isSavingIssue ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <UserAvatar
                name={createdByName}
                imageUrl={issue.createdBy?.profileImageUrl}
                className="h-8 w-8 shrink-0"
              />
              <div className="min-w-0 flex-1 rounded-lg border bg-card">
                <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
                  <span className="text-sm font-medium text-foreground">{createdByName}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(issue.createdAt)}</span>
                  {issue.isModified ? <span className="text-xs text-muted-foreground">· 수정됨</span> : null}
                  <Badge variant="outline" className="ml-auto text-[10px]">
                    작성자
                  </Badge>
                  {isOpen ? (
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={startEditing}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  ) : null}
                </div>
                <div className="px-4 py-3">
                  {issue.body ? (
                    <TiptapEditor
                      editable={false}
                      hideToolbar
                      className="border-0 bg-transparent"
                      content={issue.body ?? undefined}
                      minHeight={0}
                      onIssueMentionClick={onNavigateToIssueMention}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">아직 입력된 본문이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isTimelineLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">타임라인을 불러오는 중입니다.</div>
          ) : (
            timelineItems.map((item) =>
              item.kind === "comment" ? (
                <IssueTimelineCommentItem
                  key={item.id}
                  comment={item}
                  canEdit={Boolean(currentUser?.id && item.authorId && currentUser.id === item.authorId)}
                  issueMentionFetcher={mentionFetchers?.issue}
                  onNavigateToIssueMention={onNavigateToIssueMention}
                  onUpdate={onUpdateComment}
                  userMentionFetcher={mentionFetchers?.user}
                />
              ) : (
                <TimelineEventItem key={item.id} event={item.event} onNavigate={onNavigateToIssueMention} />
              ),
            )
          )}

          <div className="border-t" />

          <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">나</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <TiptapEditor
                key={commentEditorKey}
                placeholder="댓글을 작성하세요..."
                minHeight={100}
                userMentionFetcher={mentionFetchers?.user}
                issueMentionFetcher={mentionFetchers?.issue}
                onChangeJson={(content) => setCommentBody(content)}
                onChangeText={setCommentText}
              />
              <div className="mt-3 flex items-center justify-between">
                <div />
                <div className="flex gap-2">
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
                      {isReopeningIssue ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                      다시 열기
                    </Button>
                  )}
                  <Button
                    size="sm"
                    disabled={isCreatingComment}
                    onClick={async () => {
                      if (!commentBody || !commentText.trim()) {
                        return;
                      }

                      await onCreateComment(commentBody);
                      setCommentBody(null);
                      setCommentText("");
                      setCommentEditorKey((previous) => previous + 1);
                    }}
                  >
                    {isCreatingComment ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                    댓글
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden w-70 shrink-0 lg:block">
          <IssueSidebar
            assignees={issue.assignees}
            labels={issue.labels}
            linkedChanges={issue.linkedChanges}
            linkedIssues={issue.linkedIssues}
            relatedParts={issue.relatedParts}
            attachments={issue.attachments}
            assigneePicker={
              onSyncAssignees
                ? {
                    availableMembers,
                    selectedIds: selectedAssigneeIds,
                    onSync: onSyncAssignees,
                    onRequest: onRequestMembers ?? (() => undefined),
                    isUpdating: isMetaUpdating,
                  }
                : undefined
            }
            labelPicker={
              onSyncLabels
                ? {
                    availableLabels,
                    selectedIds: selectedLabelIds,
                    onSync: onSyncLabels,
                    onRequest: onRequestLabels ?? (() => undefined),
                    isUpdating: isMetaUpdating,
                  }
                : undefined
            }
            partPicker={
              onSyncParts
                ? {
                    searchedParts,
                    selectedIds: selectedPartIds,
                    onSync: onSyncParts,
                    onRequest: onRequestParts ?? (() => undefined),
                    onSearchChange: onPartsSearchChange,
                    isSearching: isPartsSearching,
                    isUpdating: isMetaUpdating,
                  }
                : undefined
            }
            linkedChangePicker={
              onSyncLinkedChanges
                ? {
                    availableChanges,
                    selectedIds: linkedChangeIds,
                    onSync: onSyncLinkedChanges,
                    onRequest: onRequestChanges ?? (() => undefined),
                    onSearchChange: onChangeSearchChange,
                    isSearching: isChangesSearching,
                    isUpdating: isMetaUpdating,
                  }
                : undefined
            }
            onNavigateToChange={onNavigateToChange}
            onNavigateToPart={onNavigateToPart}
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

      <ConfirmDialog
        open={isCloseConfirmOpen}
        title="이슈를 닫을까요?"
        description="닫힌 이슈는 다시 열 수 있지만, 현재 작업 흐름에서는 닫힘 상태로 집계됩니다."
        confirmLabel="이슈 닫기"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setIsCloseConfirmOpen(false)}
        onConfirm={() => {
          setIsCloseConfirmOpen(false);
          void onCloseIssue();
        }}
        onOpenChange={setIsCloseConfirmOpen}
      />
    </div>
  );
}
