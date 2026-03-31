import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
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
import { EngineeringChangeDiffTab } from "./engineering-change-diff-tab";
import {
  EngineeringChangeSidebar,
  type EngineeringChangeSidebarEngineeringChange,
  type EngineeringChangeSidebarProps,
} from "./engineering-change-sidebar";
import { TimelineEventItem, type TimelineEventData } from "./timeline-event";
import { EngineeringChangeStatusBadge } from "./work-item-status";

export interface EngineeringChangeDetailTabItem {
  id: string;
  label: string;
}

export interface EngineeringChangeDetailScreenAuthor {
  fullName: string;
  profileImageUrl?: string | null;
}

export interface EngineeringChangeDetailScreenEngineeringChange
  extends EngineeringChangeSidebarEngineeringChange {
  body: TiptapEditorProps["content"] | null;
  createdBy: EngineeringChangeDetailScreenAuthor | null;
  isModified?: boolean;
  number: number | string;
  title: string;
}

export interface EngineeringChangeDetailScreenCommentItem {
  kind: "comment";
  id: string;
  author: EngineeringChangeDetailScreenAuthor | null;
  authorId?: string | null;
  body: TiptapEditorProps["content"] | null;
  createdAt?: string;
  isModified?: boolean;
  updatedAt?: string;
}

export interface EngineeringChangeDetailScreenEventItem {
  kind: "event";
  id: string;
  event: TimelineEventData;
}

export type EngineeringChangeDetailScreenTimelineItem =
  | EngineeringChangeDetailScreenCommentItem
  | EngineeringChangeDetailScreenEventItem;

export interface EngineeringChangeDetailScreenCurrentUser {
  id?: string | null;
  name?: string | null;
  profileImageUrl?: string | null;
}

export interface EngineeringChangeDetailScreenProps {
  activeTab: string;
  conversationAccessory?: ReactNode;
  engineeringChange?: EngineeringChangeDetailScreenEngineeringChange;
  changesContent?: ReactNode;
  commentCount: number;
  currentUser?: EngineeringChangeDetailScreenCurrentUser | null;
  dialog?: unknown | null;
  headerAccessory?: ReactNode;
  isAttachingFiles?: boolean;
  isCreatingComment?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isMergingEngineeringChange?: boolean;
  isNotFound?: boolean;
  isReopeningEngineeringChange?: boolean;
  isSavingEngineeringChange?: boolean;
  isSubmittingEngineeringChange?: boolean;
  isTimelineLoading?: boolean;
  labelPicker?: EngineeringChangeSidebarProps["labelPicker"];
  linkedIssuePicker?: EngineeringChangeSidebarProps["linkedIssuePicker"];
  mentionFetchers?: {
    issue?: TiptapMentionFetcher;
    user?: TiptapMentionFetcher;
  };
  onAttachFiles: (files: File[]) => Promise<void>;
  onBack: () => void;
  onCloseEngineeringChange: () => Promise<void> | void;
  onCreateComment: (body: TiptapEditorProps["content"] | null) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onEditIssues?: () => void;
  onEditLabels?: () => void;
  onEditParts?: () => void;
  onMergeEngineeringChange: () => Promise<void> | void;
  onNavigateToIssue: (issueNumber: number) => void;
  onNavigateToIssueMention: (issueNumber: number, issueType: "issue" | "engineering_change") => void;
  onReopenEngineeringChange: () => Promise<void> | void;
  onRetry?: () => void;
  onSaveEngineeringChange: (input: { body: TiptapEditorProps["content"] | null; title: string }) => Promise<void>;
  onSubmitEngineeringChange: () => Promise<void> | void;
  onTabChange: (tab: string) => void;
  onUpdateComment: (commentId: string, body: TiptapEditorProps["content"] | null) => Promise<void>;
  partPicker?: EngineeringChangeSidebarProps["partPicker"];
  tabs: readonly EngineeringChangeDetailTabItem[];
  timelineItems: EngineeringChangeDetailScreenTimelineItem[];
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

function ChangeTimelineCommentItem({
  comment,
  canEdit,
  issueMentionFetcher,
  onNavigateToIssueMention,
  onUpdate,
  userMentionFetcher,
}: {
  comment: EngineeringChangeDetailScreenCommentItem;
  canEdit: boolean;
  issueMentionFetcher?: TiptapMentionFetcher;
  onNavigateToIssueMention: (issueNumber: number, issueType: "issue" | "engineering_change") => void;
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

export function EngineeringChangeDetailScreen({
  activeTab,
  conversationAccessory,
  engineeringChange,
  changesContent,
  commentCount,
  currentUser,
  headerAccessory,
  isAttachingFiles = false,
  isCreatingComment = false,
  isError = false,
  isLoading = false,
  isMergingEngineeringChange = false,
  isNotFound = false,
  isReopeningEngineeringChange = false,
  isSavingEngineeringChange = false,
  isSubmittingEngineeringChange = false,
  isTimelineLoading = false,
  labelPicker,
  linkedIssuePicker,
  mentionFetchers,
  onAttachFiles,
  onBack,
  onCloseEngineeringChange,
  onCreateComment,
  onDeleteComment: _onDeleteComment,
  onDeleteFile,
  onEditIssues,
  onEditLabels,
  onEditParts,
  onMergeEngineeringChange,
  onNavigateToIssue,
  onNavigateToIssueMention,
  onReopenEngineeringChange,
  onRetry,
  onSaveEngineeringChange,
  onSubmitEngineeringChange,
  onTabChange,
  onUpdateComment,
  partPicker,
  tabs,
  timelineItems,
}: EngineeringChangeDetailScreenProps) {
  const [bodyDraft, setBodyDraft] = useState<TiptapEditorProps["content"] | null>(engineeringChange?.body ?? null);
  const [commentBody, setCommentBody] = useState<TiptapEditorProps["content"] | null>(null);
  const [commentEditorKey, setCommentEditorKey] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(engineeringChange?.title ?? "");

  useEffect(() => {
    setBodyDraft(engineeringChange?.body ?? null);
    setTitleDraft(engineeringChange?.title ?? "");
    setIsEditing(false);
  }, [engineeringChange?.number, engineeringChange?.updatedAt]);

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
          <p className="text-sm text-muted-foreground">변경관리를 불러오지 못했습니다.</p>
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
          <p className="text-sm text-muted-foreground">변경관리를 찾을 수 없습니다.</p>
          <Button type="button" variant="outline" onClick={onBack}>
            목록으로
          </Button>
        </div>
      </div>
    );
  }

  if (!engineeringChange) {
    return null;
  }

  const canSubmit = engineeringChange.engineeringChangeState === "DRAFT";
  const canMerge =
    engineeringChange.engineeringChangeState === "OPEN" || engineeringChange.engineeringChangeState === "SUBMITTED";
  const canClose =
    engineeringChange.engineeringChangeState === "DRAFT" ||
    engineeringChange.engineeringChangeState === "OPEN" ||
    engineeringChange.engineeringChangeState === "SUBMITTED";
  const canReopen = engineeringChange.engineeringChangeState === "CLOSED";
  const isEditable =
    engineeringChange.engineeringChangeState !== "MERGED" &&
    engineeringChange.engineeringChangeState !== "CLOSED";
  const createdByName = engineeringChange.createdBy?.fullName ?? "알 수 없음";
  const startEditing = () => {
    setTitleDraft(engineeringChange.title);
    setBodyDraft(engineeringChange.body);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setTitleDraft(engineeringChange.title);
    setBodyDraft(engineeringChange.body);
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
        변경관리 목록
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
            {engineeringChange.title}
            <span className="ml-2 font-normal text-muted-foreground">#{engineeringChange.number}</span>
          </h2>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <EngineeringChangeStatusBadge state={engineeringChange.engineeringChangeState} />
          <span className="text-sm text-muted-foreground">{formatFullDate(engineeringChange.createdAt)} 생성</span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            댓글 {commentCount}개
          </span>
        </div>
        {headerAccessory ? <div className="mt-4">{headerAccessory}</div> : null}
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
        <div className="mt-6 space-y-5">
          {conversationAccessory ? <div>{conversationAccessory}</div> : null}
          <div className="flex gap-6">
            <div className="min-w-0 flex-1 space-y-4">
              {isEditing ? (
                <div>
                  <TiptapEditor
                    content={bodyDraft ?? undefined}
                    placeholder="변경관리 본문을 입력하세요"
                    minHeight={100}
                    userMentionFetcher={mentionFetchers?.user}
                    issueMentionFetcher={mentionFetchers?.issue}
                    onChangeJson={(content) => setBodyDraft(content)}
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={cancelEditing} disabled={isSavingEngineeringChange}>
                      취소
                    </Button>
                    <Button
                      disabled={!titleDraft.trim() || isSavingEngineeringChange}
                      type="button"
                      onClick={async () => {
                        try {
                          await onSaveEngineeringChange({ title: titleDraft.trim(), body: bodyDraft });
                          setIsEditing(false);
                        } catch {
                          return;
                        }
                      }}
                    >
                      {isSavingEngineeringChange ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <UserAvatar
                    name={createdByName}
                    imageUrl={engineeringChange.createdBy?.profileImageUrl}
                    className="h-8 w-8 shrink-0"
                  />
                </div>
                <div className="min-w-0 flex-1 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
                    <span className="text-sm font-medium text-foreground">{createdByName}</span>
                    <Badge variant="outline" className="text-[10px]">
                      본문
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(engineeringChange.createdAt)}
                    </span>
                    {engineeringChange.isModified ? (
                      <span className="text-xs text-muted-foreground">· 수정됨</span>
                    ) : null}
                    {isEditable ? (
                      <Button variant="ghost" size="icon" className="ml-auto h-6 w-6 shrink-0" onClick={startEditing}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="px-4 py-3">
                    {engineeringChange.body ? (
                      <TiptapEditor
                        editable={false}
                        hideToolbar
                        className="border-0 bg-transparent"
                        content={engineeringChange.body ?? undefined}
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
                          변경관리 닫기
                        </Button>
                      ) : null}
                      {canSubmit ? (
                        <Button
                          size="sm"
                          disabled={isSubmittingEngineeringChange}
                          onClick={() => {
                            void onSubmitEngineeringChange();
                          }}
                        >
                          {isSubmittingEngineeringChange ? (
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
                          disabled={isMergingEngineeringChange}
                          onClick={() => {
                            void onMergeEngineeringChange();
                          }}
                        >
                          {isMergingEngineeringChange ? (
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
                          disabled={isReopeningEngineeringChange}
                          onClick={() => {
                            void onReopenEngineeringChange();
                          }}
                        >
                          {isReopeningEngineeringChange ? (
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
              <EngineeringChangeSidebar
                engineeringChange={engineeringChange}
                labelPicker={labelPicker}
                partPicker={partPicker}
                linkedIssuePicker={linkedIssuePicker}
                isAttachingFiles={isAttachingFiles}
                onAttachFiles={onAttachFiles}
                onDeleteFile={onDeleteFile}
                onEditIssues={onEditIssues}
                onEditLabels={onEditLabels}
                onEditParts={onEditParts}
                onNavigateToIssue={onNavigateToIssue}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">{changesContent ?? <EngineeringChangeDiffTab />}</div>
      )}

      <ConfirmDialog
        open={isCloseConfirmOpen}
        title="변경관리를 닫을까요?"
        description="닫힌 변경관리는 다시 제출할 수 있지만, 현재 작업 흐름에서는 닫힘 상태로 집계됩니다."
        confirmLabel="변경관리 닫기"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setIsCloseConfirmOpen(false)}
        onConfirm={() => {
          void onCloseEngineeringChange();
        }}
        onOpenChange={setIsCloseConfirmOpen}
      />
    </div>
  );
}
