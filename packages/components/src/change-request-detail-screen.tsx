import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  FilePen,
  Loader2,
  MessageSquare,
  Pencil,
  XCircle,
} from "lucide-react";
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
import { ChangeRequestDiffTab } from "./change-request-diff-tab";
import {
  ChangeRequestSidebar,
  type ChangeRequestSidebarChangeRequest,
  type ChangeRequestSidebarProps,
} from "./change-request-sidebar";
import { TimelineEventItem, type TimelineEventData } from "./timeline-event";

export interface ChangeRequestDetailTabItem {
  id: string;
  label: string;
}

export interface ChangeRequestDetailScreenAuthor {
  fullName: string;
  profileImageUrl?: string | null;
}

export interface ChangeRequestDetailScreenChangeRequest
  extends ChangeRequestSidebarChangeRequest {
  body: TiptapEditorProps["content"] | null;
  createdBy: ChangeRequestDetailScreenAuthor | null;
  isModified?: boolean;
  number: number | string;
  title: string;
}

export interface ChangeRequestDetailScreenCommentItem {
  kind: "comment";
  id: string;
  author: ChangeRequestDetailScreenAuthor | null;
  authorId?: string | null;
  body: TiptapEditorProps["content"] | null;
  createdAt?: string;
  isModified?: boolean;
  updatedAt?: string;
}

export interface ChangeRequestDetailScreenEventItem {
  kind: "event";
  id: string;
  event: TimelineEventData;
}

export type ChangeRequestDetailScreenTimelineItem =
  | ChangeRequestDetailScreenCommentItem
  | ChangeRequestDetailScreenEventItem;

export interface ChangeRequestDetailScreenCurrentUser {
  id?: string | null;
  name?: string | null;
  profileImageUrl?: string | null;
}

export interface ChangeRequestDetailScreenProps {
  activeTab: string;
  assigneePicker?: ChangeRequestSidebarProps["assigneePicker"];
  changeRequest?: ChangeRequestDetailScreenChangeRequest;
  changesContent?: ReactNode;
  commentCount: number;
  currentUser?: ChangeRequestDetailScreenCurrentUser | null;
  dialog?: unknown | null;
  isAttachingFiles?: boolean;
  isCreatingComment?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isMergingChangeRequest?: boolean;
  isNotFound?: boolean;
  isReopeningChangeRequest?: boolean;
  isSavingChangeRequest?: boolean;
  isSubmittingChangeRequest?: boolean;
  isTimelineLoading?: boolean;
  labelPicker?: ChangeRequestSidebarProps["labelPicker"];
  linkedIssuePicker?: ChangeRequestSidebarProps["linkedIssuePicker"];
  mentionFetchers?: {
    issue?: TiptapMentionFetcher;
    user?: TiptapMentionFetcher;
  };
  onAttachFiles: (files: File[]) => Promise<void>;
  onBack: () => void;
  onCloseChangeRequest: () => Promise<void> | void;
  onCreateComment: (body: TiptapEditorProps["content"] | null) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onEditAssignees?: () => void;
  onEditIssues?: () => void;
  onEditLabels?: () => void;
  onEditParts?: () => void;
  onEditReviewers?: () => void;
  onMergeChangeRequest: () => Promise<void> | void;
  onNavigateToIssue: (issueNumber: number) => void;
  onNavigateToIssueMention: (issueNumber: number, issueType: "issue" | "change_request") => void;
  onReopenChangeRequest: () => Promise<void> | void;
  onRetry?: () => void;
  onSaveChangeRequest: (input: { body: TiptapEditorProps["content"] | null; title: string }) => Promise<void>;
  onSubmitChangeRequest: () => Promise<void> | void;
  onTabChange: (tab: string) => void;
  onUpdateComment: (commentId: string, body: TiptapEditorProps["content"] | null) => Promise<void>;
  partPicker?: ChangeRequestSidebarProps["partPicker"];
  reviewerPicker?: ChangeRequestSidebarProps["reviewerPicker"];
  tabs: readonly ChangeRequestDetailTabItem[];
  timelineItems: ChangeRequestDetailScreenTimelineItem[];
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

const STATE_BADGE_STYLE: Record<string, string> = {
  DRAFT: "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400",
  OPEN: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  SUBMITTED: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-400",
  MERGED: "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-400",
  CLOSED: "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400",
};

const STATE_LABEL: Record<string, string> = {
  DRAFT: "초안",
  OPEN: "열림",
  SUBMITTED: "제출됨",
  MERGED: "반영됨",
  CLOSED: "닫힘",
};

function ChangeRequestStatusIcon({ state }: { state: string }) {
  const className = "h-4 w-4";

  if (state === "MERGED") {
    return <CheckCircle2 className={`${className} text-purple-600 dark:text-purple-400`} />;
  }

  if (state === "CLOSED") {
    return <XCircle className={`${className} text-red-500 dark:text-red-400`} />;
  }

  if (state === "SUBMITTED") {
    return <FileCheck className={`${className} text-blue-600 dark:text-blue-400`} />;
  }

  if (state === "DRAFT") {
    return <FilePen className={`${className} text-gray-500 dark:text-gray-400`} />;
  }

  return <AlertCircle className={`${className} text-emerald-600 dark:text-emerald-400`} />;
}

function ChangeTimelineCommentItem({
  comment,
  canEdit,
  issueMentionFetcher,
  onNavigateToIssueMention,
  onUpdate,
  userMentionFetcher,
}: {
  comment: ChangeRequestDetailScreenCommentItem;
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
          name={comment.author?.fullName ?? "알 수 없는 사용자"}
          imageUrl={comment.author?.profileImageUrl}
          className="h-8 w-8 shrink-0"
        />
      </div>
      <div className="min-w-0 flex-1 rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
          <span className="text-sm font-medium text-foreground">
            {comment.author?.fullName ?? "알 수 없는 사용자"}
          </span>
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.createdAt ?? comment.updatedAt ?? new Date().toISOString())}
          </span>
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

export function ChangeRequestDetailScreen({
  activeTab,
  assigneePicker,
  changeRequest,
  changesContent,
  commentCount,
  currentUser,
  isAttachingFiles = false,
  isCreatingComment = false,
  isError = false,
  isLoading = false,
  isMergingChangeRequest = false,
  isNotFound = false,
  isReopeningChangeRequest = false,
  isSavingChangeRequest = false,
  isSubmittingChangeRequest = false,
  isTimelineLoading = false,
  labelPicker,
  linkedIssuePicker,
  mentionFetchers,
  onAttachFiles,
  onBack,
  onCloseChangeRequest,
  onCreateComment,
  onDeleteComment: _onDeleteComment,
  onDeleteFile,
  onEditAssignees,
  onEditIssues,
  onEditLabels,
  onEditParts,
  onEditReviewers,
  onMergeChangeRequest,
  onNavigateToIssue,
  onNavigateToIssueMention,
  onReopenChangeRequest,
  onRetry,
  onSaveChangeRequest,
  onSubmitChangeRequest,
  onTabChange,
  onUpdateComment,
  partPicker,
  reviewerPicker,
  tabs,
  timelineItems,
}: ChangeRequestDetailScreenProps) {
  const [bodyDraft, setBodyDraft] = useState<TiptapEditorProps["content"] | null>(changeRequest?.body ?? null);
  const [commentBody, setCommentBody] = useState<TiptapEditorProps["content"] | null>(null);
  const [commentEditorKey, setCommentEditorKey] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(changeRequest?.title ?? "");

  useEffect(() => {
    setBodyDraft(changeRequest?.body ?? null);
    setTitleDraft(changeRequest?.title ?? "");
    setIsEditing(false);
  }, [changeRequest?.number, changeRequest?.updatedAt]);

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
          <p className="text-sm text-muted-foreground">변경 요청을 불러오지 못했습니다.</p>
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

  if (isNotFound) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">변경 요청을 찾을 수 없습니다.</p>
          <Button type="button" variant="outline" onClick={onBack}>
            목록으로
          </Button>
        </div>
      </div>
    );
  }

  if (!changeRequest) {
    return null;
  }

  const canSubmit = changeRequest.crState === "DRAFT";
  const canMerge = changeRequest.crState === "OPEN" || changeRequest.crState === "SUBMITTED";
  const canClose =
    changeRequest.crState === "DRAFT" ||
    changeRequest.crState === "OPEN" ||
    changeRequest.crState === "SUBMITTED";
  const canReopen = changeRequest.crState === "CLOSED";
  const isEditable = changeRequest.crState !== "MERGED" && changeRequest.crState !== "CLOSED";
  const createdByName = changeRequest.createdBy?.fullName ?? "알 수 없음";

  const startEditing = () => {
    setTitleDraft(changeRequest.title);
    setBodyDraft(changeRequest.body);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setTitleDraft(changeRequest.title);
    setBodyDraft(changeRequest.body);
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-[1160px]">
      <button
        type="button"
        className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={onBack}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        변경 요청 목록
      </button>

      <div>
        {isEditing ? (
          <Input
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            maxLength={500}
            className="h-auto border-0 px-0 text-xl font-bold shadow-none focus-visible:ring-0"
            autoFocus
          />
        ) : (
          <h2 className="text-xl font-bold text-foreground">
            {changeRequest.title}
            <span className="ml-2 font-normal text-muted-foreground">#{changeRequest.number}</span>
          </h2>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={STATE_BADGE_STYLE[changeRequest.crState] ?? ""}>
            <ChangeRequestStatusIcon state={changeRequest.crState} />
            {STATE_LABEL[changeRequest.crState] ?? changeRequest.crState}
          </Badge>
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{createdByName}</span>
            {" 님이 "}
            {formatFullDate(changeRequest.createdAt)}
            {" 에 열었습니다"}
          </span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            댓글 {commentCount}개
          </span>
        </div>
      </div>

      <div className="mt-5 flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`relative cursor-pointer px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id ? <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" /> : null}
          </button>
        ))}
      </div>

      {activeTab === "conversation" ? (
        <div className="mt-6 flex gap-6">
          <div className="min-w-0 flex-1 space-y-4">
            {isEditing ? (
              <div>
                <TiptapEditor
                  content={bodyDraft ?? undefined}
                  placeholder="변경 요청 본문을 입력하세요"
                  minHeight={100}
                  userMentionFetcher={mentionFetchers?.user}
                  issueMentionFetcher={mentionFetchers?.issue}
                  onChangeJson={(content) => setBodyDraft(content)}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={cancelEditing} disabled={isSavingChangeRequest}>
                    취소
                  </Button>
                  <Button
                    disabled={!titleDraft.trim() || isSavingChangeRequest}
                    type="button"
                    onClick={async () => {
                      try {
                        await onSaveChangeRequest({ title: titleDraft.trim(), body: bodyDraft });
                        setIsEditing(false);
                      } catch {
                        return;
                      }
                    }}
                  >
                    {isSavingChangeRequest ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                    저장
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <UserAvatar
                  name={createdByName}
                  imageUrl={changeRequest.createdBy?.profileImageUrl}
                  className="h-8 w-8 shrink-0"
                />
                <div className="min-w-0 flex-1 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
                    <span className="text-sm font-medium text-foreground">{createdByName}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(changeRequest.createdAt)}</span>
                    {changeRequest.isModified ? (
                      <span className="text-xs text-muted-foreground">· 수정됨</span>
                    ) : null}
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      작성자
                    </Badge>
                    {isEditable ? (
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={startEditing}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="px-4 py-3">
                    {changeRequest.body ? (
                      <TiptapEditor
                        editable={false}
                        hideToolbar
                        className="border-0 bg-transparent"
                        content={changeRequest.body ?? undefined}
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
                  <ChangeTimelineCommentItem
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
                    {canClose ? (
                      <Button size="sm" variant="outline" onClick={() => setIsCloseConfirmOpen(true)}>
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        변경 요청 닫기
                      </Button>
                    ) : null}
                    {canSubmit ? (
                      <Button
                        size="sm"
                        disabled={isSubmittingChangeRequest}
                        onClick={() => {
                          void onSubmitChangeRequest();
                        }}
                      >
                        {isSubmittingChangeRequest ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FileCheck className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        제출
                      </Button>
                    ) : null}
                    {canMerge ? (
                      <Button
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        disabled={isMergingChangeRequest}
                        onClick={() => {
                          void onMergeChangeRequest();
                        }}
                      >
                        {isMergingChangeRequest ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        변경 반영
                      </Button>
                    ) : null}
                    {canReopen ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isReopeningChangeRequest}
                        onClick={() => {
                          void onReopenChangeRequest();
                        }}
                      >
                        {isReopeningChangeRequest ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        다시 제출
                      </Button>
                    ) : null}
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
            <ChangeRequestSidebar
              changeRequest={changeRequest}
              assigneePicker={assigneePicker}
              reviewerPicker={reviewerPicker}
              labelPicker={labelPicker}
              partPicker={partPicker}
              linkedIssuePicker={linkedIssuePicker}
              isAttachingFiles={isAttachingFiles}
              onAttachFiles={onAttachFiles}
              onDeleteFile={onDeleteFile}
              onEditAssignees={onEditAssignees}
              onEditIssues={onEditIssues}
              onEditLabels={onEditLabels}
              onEditParts={onEditParts}
              onEditReviewers={onEditReviewers}
              onNavigateToIssue={onNavigateToIssue}
            />
          </div>
        </div>
      ) : (
        <div className="mt-6">{changesContent ?? <ChangeRequestDiffTab />}</div>
      )}

      <ConfirmDialog
        open={isCloseConfirmOpen}
        title="변경 요청을 닫을까요?"
        description="닫힌 변경 요청은 다시 제출할 수 있지만, 현재 작업 흐름에서는 닫힘 상태로 집계됩니다."
        confirmLabel="변경 요청 닫기"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setIsCloseConfirmOpen(false)}
        onConfirm={() => {
          void onCloseChangeRequest();
        }}
        onOpenChange={setIsCloseConfirmOpen}
      />
    </div>
  );
}
