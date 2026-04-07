import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileCheck,
  Loader2,
  MessageSquare,
  Pencil,
  X,
  XCircle,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  ConfirmDialog,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TiptapEditor,
  type TiptapEditorProps,
  type TiptapMentionFetcher,
  UserAvatar,
} from "@fabbit/ui";
import { EngineeringChangeDiffTab } from "./engineering-change-diff-tab";
import { MemberPickerSection } from "./member-picker-section";
import {
  EngineeringChangeSidebar,
  type EngineeringChangeSidebarEngineeringChange,
  type EngineeringChangeSidebarProps,
} from "./engineering-change-sidebar";
import { TimelineEventItem, type TimelineEventData } from "./timeline-event";
import type {
  EngineeringChangeCompletionPolicy,
  EngineeringChangeWorkflowData,
  EngineeringChangeWorkflowStage,
  EngineeringChangeWorkflowAssignee,
} from "./engineering-change-workflow-section";
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
  workflowData?: EngineeringChangeWorkflowData;
  workflowStagePicker?: WorkflowStagePickerProps;
  isCreatingComment?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isMergingEngineeringChange?: boolean;
  isNotFound?: boolean;
  isReopeningEngineeringChange?: boolean;
  isSavingEngineeringChange?: boolean;
  isStepActionPending?: boolean;
  isSubmittingEngineeringChange?: boolean;
  currentUserStepId?: string | null;
  isEcCreator?: boolean;
  isTimelineLoading?: boolean;
  affectedItemPicker?: EngineeringChangeSidebarProps["affectedItemPicker"];
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
  onMergeEngineeringChange: () => Promise<void> | void;
  onStepApprove?: (stepId: string, comment?: string) => void;
  onStepReject?: (stepId: string, comment?: string) => void;
  onStepRequestChanges?: (stepId: string, comment?: string) => void;
  onStepResubmit?: (stepId: string) => void;
  onNavigateToIssue: (issueNumber: number) => void;
  onNavigateToIssueMention: (issueNumber: number, issueType: "issue" | "engineering_change") => void;
  onReopenEngineeringChange: () => Promise<void> | void;
  onRetry?: () => void;
  onSaveEngineeringChange: (input: { body: TiptapEditorProps["content"] | null; title: string }) => Promise<void>;
  onSubmitEngineeringChange: () => Promise<void> | void;
  onTabChange: (tab: string) => void;
  onUpdateComment: (commentId: string, body: TiptapEditorProps["content"] | null) => Promise<void>;
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

function WorkflowSummaryBar({ stages, ecState }: { stages: EngineeringChangeWorkflowStage[]; ecState: string }) {
  const activeStage = stages.find((s) => s.status === "active");
  const allCompleted = stages.every((s) => s.status === "completed");
  const isDraft = ecState === "DRAFT";

  let summaryLabel: string;
  let summaryDetail: string;

  if (isDraft) {
    summaryLabel = "초안";
    summaryDetail = "제출 후 워크플로우가 시작됩니다";
  } else if (allCompleted) {
    summaryLabel = "완료";
    summaryDetail = "모든 단계가 완료되었습니다";
  } else if (activeStage) {
    const pendingAssignees = activeStage.assignees.filter((a) => a.status === "PENDING");
    summaryLabel = activeStage.label;
    summaryDetail = pendingAssignees.length > 0
      ? `${pendingAssignees.map((a) => a.name).join(", ")} 대기`
      : "모든 담당자 완료";
  } else {
    summaryLabel = "대기";
    summaryDetail = "워크플로우 진행 대기";
  }

  const currentIndex = stages.findIndex((s) => s.status === "active");

  return (
    <div className="flex items-center justify-between border-y bg-muted/20 px-0 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{summaryLabel}</span>
        <span className="text-xs text-muted-foreground">— {summaryDetail}</span>
      </div>
      <div className="flex items-center gap-0">
        {stages.map((stage, index) => {
          const done = currentIndex >= 0 ? index < currentIndex : stage.status === "completed";
          const active = currentIndex >= 0 ? index === currentIndex : stage.status === "active";

          return (
            <div key={stage.id} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[9px] font-bold ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-2.5 w-2.5" /> : index + 1}
                </div>
                <span className={`text-xs ${active || done ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 ? (
                <div className="mx-2 h-px w-4 bg-muted-foreground/30">
                  <div className={`h-full ${done ? "bg-primary" : ""}`} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const COMPLETION_POLICY_LABELS: Record<EngineeringChangeCompletionPolicy, string> = {
  ALL_MUST_APPROVE: "전원 승인",
  ANY_ONE_APPROVES: "1인 승인",
  MIN_N_APPROVES: "최소 N인 승인",
};

const STAGE_ASSIGNEE_LABEL: Record<string, string> = {
  REVIEW: "검토자",
  APPROVAL: "승인자",
  RELEASE: "배포자",
};

interface WorkflowStagePickerProps {
  availableMembers: { id: string; name: string; email: string }[];
  onRequest: () => void;
  onSearchChange: (search: string) => void;
  onSyncStages: (stages: {
    stageType: string;
    stageId?: string | null;
    completionPolicy: EngineeringChangeCompletionPolicy;
    minApprovals?: number | null;
    deadline?: string | null;
    assignees: { id: string; type: "USER" | "TEAM" }[];
  }[]) => void;
  isSearching?: boolean;
  isUpdating?: boolean;
}

function WorkflowStepRailAccordion({
  stages,
  stagePicker,
}: {
  stages: EngineeringChangeWorkflowStage[];
  stagePicker?: WorkflowStagePickerProps;
}) {
  const [expanded, setExpanded] = useState(false);
  const currentIndex = stages.findIndex((s) => s.status === "active");

  function handleRemoveAssignee(stage: EngineeringChangeWorkflowStage, assigneeId: string) {
    if (!stagePicker) return;
    const updatedStages = stages.map((s) => ({
      stageType: s.type,
      stageId: s.stageId,
      completionPolicy: s.completionPolicy ?? ("ALL_MUST_APPROVE" as EngineeringChangeCompletionPolicy),
      minApprovals: s.minApprovals,
      deadline: s.deadline,
      assignees: s.type === stage.type
        ? s.assignees.filter((a) => a.assigneeId !== assigneeId).map((a) => ({ id: a.assigneeId, type: a.type }))
        : s.assignees.map((a) => ({ id: a.assigneeId, type: a.type })),
    }));
    stagePicker.onSyncStages(updatedStages);
  }

  function handleAddAssignees(stage: EngineeringChangeWorkflowStage, userIds: string[]) {
    if (!stagePicker) return;
    const existingIds = new Set(stage.assignees.map((a) => a.assigneeId));
    const newAssignees = userIds.filter((id) => !existingIds.has(id)).map((id) => ({ id, type: "USER" as const }));
    const updatedStages = stages.map((s) => ({
      stageType: s.type,
      stageId: s.stageId,
      completionPolicy: s.completionPolicy ?? ("ALL_MUST_APPROVE" as EngineeringChangeCompletionPolicy),
      minApprovals: s.minApprovals,
      deadline: s.deadline,
      assignees: s.type === stage.type
        ? [...s.assignees.map((a) => ({ id: a.assigneeId, type: a.type })), ...newAssignees]
        : s.assignees.map((a) => ({ id: a.assigneeId, type: a.type })),
    }));
    stagePicker.onSyncStages(updatedStages);
  }

  function handlePolicyChange(stage: EngineeringChangeWorkflowStage, policy: EngineeringChangeCompletionPolicy) {
    if (!stagePicker) return;
    const updatedStages = stages.map((s) => ({
      stageType: s.type,
      stageId: s.stageId,
      completionPolicy: s.type === stage.type ? policy : (s.completionPolicy ?? "ALL_MUST_APPROVE" as EngineeringChangeCompletionPolicy),
      minApprovals: s.type === stage.type && policy === "MIN_N_APPROVES" ? (s.minApprovals ?? 1) : s.minApprovals,
      deadline: s.deadline,
      assignees: s.assignees.map((a) => ({ id: a.assigneeId, type: a.type })),
    }));
    stagePicker.onSyncStages(updatedStages);
  }

  function handleMinApprovalsChange(stage: EngineeringChangeWorkflowStage, value: number) {
    if (!stagePicker) return;
    const updatedStages = stages.map((s) => ({
      stageType: s.type,
      stageId: s.stageId,
      completionPolicy: s.completionPolicy ?? ("ALL_MUST_APPROVE" as EngineeringChangeCompletionPolicy),
      minApprovals: s.type === stage.type ? value : s.minApprovals,
      deadline: s.deadline,
      assignees: s.assignees.map((a) => ({ id: a.assigneeId, type: a.type })),
    }));
    stagePicker.onSyncStages(updatedStages);
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((p) => !p)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((p) => !p);
          }
        }}
        className="cursor-pointer rounded-lg border bg-background px-4 py-3 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-0">
              {stages.map((stage, index) => {
                const isCompleted = currentIndex >= 0 ? index < currentIndex : stage.status === "completed";
                const isCurrent = currentIndex >= 0 ? index === currentIndex : stage.status === "active";

                return (
                  <div key={stage.id} className="flex min-w-0 flex-1 items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                          isCompleted
                            ? "border-primary bg-primary text-primary-foreground"
                            : isCurrent
                              ? "border-primary bg-background text-primary"
                              : "border-muted-foreground/30 bg-background text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-medium ${isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {stage.label}
                        </p>
                        {stage.description ? (
                          <p className="truncate text-[11px] text-muted-foreground">{stage.description}</p>
                        ) : null}
                      </div>
                    </div>
                    {index < stages.length - 1 ? (
                      <div className="mx-4 h-px flex-1 bg-muted-foreground/30">
                        <div className={`h-full ${isCompleted ? "bg-primary" : "bg-transparent"}`} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </div>
      </div>

      {expanded ? (
        <div className="grid gap-3">
          {stages.map((stage) => {
            const label = STAGE_ASSIGNEE_LABEL[stage.type] ?? "담당자";
            const canEdit = stagePicker && stage.status !== "completed";

            return (
              <div key={stage.id} className="rounded-xl border bg-card">
                <div className="px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{stage.label}</p>
                      {stage.description ? (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{stage.description}</p>
                      ) : null}
                    </div>
                    {canEdit ? (
                      <div className="flex items-center gap-1.5">
                        {stage.completionPolicy === "MIN_N_APPROVES" ? (
                          <>
                            <span className="text-xs text-muted-foreground">최소</span>
                            <Input
                              type="number"
                              min={1}
                              max={stage.assignees.length || 10}
                              value={stage.minApprovals ?? 1}
                              onChange={(e) => handleMinApprovalsChange(stage, Number(e.target.value) || 1)}
                              className="h-7 w-14 text-center text-xs"
                            />
                            <span className="text-xs text-muted-foreground">인</span>
                          </>
                        ) : null}
                        <Select
                          value={stage.completionPolicy ?? "ALL_MUST_APPROVE"}
                          onValueChange={(value) => handlePolicyChange(stage, value as EngineeringChangeCompletionPolicy)}
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(COMPLETION_POLICY_LABELS).map(([value, policyLabel]) => (
                              <SelectItem key={value} value={value}>{policyLabel}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : stage.completionPolicy ? (
                      <span className="text-xs text-muted-foreground">
                        {stage.completionPolicy === "MIN_N_APPROVES" && stage.minApprovals
                          ? `최소 ${stage.minApprovals}인 승인`
                          : COMPLETION_POLICY_LABELS[stage.completionPolicy] ?? stage.completionPolicy}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    {canEdit ? (
                      <MemberPickerSection
                        label=""
                        applyLabel={`${label} 추가`}
                        availableMembers={stagePicker.availableMembers}
                        selectedIds={stage.assignees.map((a) => a.assigneeId)}
                        displayItems={[]}
                        onSync={(userIds) => handleAddAssignees(stage, userIds)}
                        onRequestMembers={stagePicker.onRequest}
                        onSearchChange={stagePicker.onSearchChange}
                        isSearching={stagePicker.isSearching}
                        isUpdating={stagePicker.isUpdating}
                      />
                    ) : null}
                  </div>
                  {stage.assignees.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {stage.assignees.map((assignee) => (
                        <div key={assignee.id} className="flex items-center justify-between gap-2 py-2">
                          <div className="flex items-center gap-2">
                            <UserAvatar name={assignee.name} imageUrl={assignee.profileImageUrl} className="h-6 w-6 text-[10px]" />
                            <span className="text-sm font-medium text-foreground">{assignee.name}</span>
                            {assignee.actedAt ? (
                              <span className="text-xs text-muted-foreground">
                                {assignee.status === "APPROVED" ? "승인" : assignee.status === "CHANGES_REQUESTED" ? "수정 요청" : ""}
                              </span>
                            ) : null}
                          </div>
                          {canEdit && assignee.status === "PENDING" ? (
                            <button
                              type="button"
                              className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                              onClick={() => handleRemoveAssignee(stage, assignee.assigneeId)}
                              aria-label={`${assignee.name} 제거`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-2 text-xs text-muted-foreground">{label}가 아직 지정되지 않았습니다.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function GateCardAssigneeRow({ assignee }: { assignee: EngineeringChangeWorkflowAssignee }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <UserAvatar name={assignee.name} imageUrl={assignee.profileImageUrl} className="h-6 w-6 text-[10px]" />
      <span className="text-sm font-medium text-foreground">{assignee.name}</span>
      {assignee.subtitle ? (
        <span className="text-xs text-muted-foreground">{assignee.subtitle}</span>
      ) : null}
      {assignee.status === "APPROVED" ? (
        <Badge variant="outline" className="ml-auto border-green-200 bg-green-50 text-green-600 text-[10px]">
          승인
        </Badge>
      ) : assignee.status === "REJECTED" ? (
        <Badge variant="outline" className="ml-auto border-red-200 bg-red-50 text-red-600 text-[10px]">
          반려
        </Badge>
      ) : assignee.status === "CHANGES_REQUESTED" ? (
        <Badge variant="outline" className="ml-auto border-amber-200 bg-amber-50 text-amber-600 text-[10px]">
          수정 요청
        </Badge>
      ) : assignee.status === "CANCELED" ? (
        <Badge variant="outline" className="ml-auto text-muted-foreground text-[10px]">
          취소됨
        </Badge>
      ) : (
        <Badge variant="outline" className="ml-auto text-[10px]">대기</Badge>
      )}
    </div>
  );
}

function WorkflowGateCard({
  stage,
  isActionPending,
  currentUserStepId,
  isEcCreator,
  onStepApprove,
  onStepReject,
  onStepRequestChanges,
  onStepResubmit,
  picker,
}: {
  stage: EngineeringChangeWorkflowStage;
  isActionPending: boolean;
  currentUserStepId?: string | null;
  isEcCreator?: boolean;
  onStepApprove?: (stepId: string, comment?: string) => void;
  onStepReject?: (stepId: string, comment?: string) => void;
  onStepRequestChanges?: (stepId: string, comment?: string) => void;
  onStepResubmit?: (stepId: string) => void;
  picker?: {
    availableMembers: { id: string; name: string; email: string }[];
    selectedIds: string[];
    onRequest: () => void;
    onSearchChange: (search: string) => void;
    onSync: (userIds: string[]) => void;
    isSearching?: boolean;
    isUpdating?: boolean;
  };
}) {
  const [expanded, setExpanded] = useState(true);
  const [actionMode, setActionMode] = useState<"none" | "reject" | "request-changes">("none");
  const [actionComment, setActionComment] = useState("");
  const approvedCount = stage.assignees.filter((a) => a.status === "APPROVED").length;
  const totalCount = stage.assignees.length;
  const pendingCount = stage.assignees.filter((a) => a.status === "PENDING").length;
  const changesRequestedCount = stage.assignees.filter((a) => a.status === "CHANGES_REQUESTED").length;

  const currentUserStep = currentUserStepId
    ? stage.assignees.find((a) => a.id === currentUserStepId)
    : null;
  const canAct = currentUserStep?.status === "PENDING";
  const changesRequestedSteps = stage.assignees.filter((a) => a.status === "CHANGES_REQUESTED");

  const STAGE_PICKER_LABEL: Record<string, string> = {
    REVIEW: "검토자",
    APPROVAL: "승인자",
    RELEASE: "배포자",
  };
  const pickerLabel = STAGE_PICKER_LABEL[stage.type] ?? "담당자";

  let summaryText: string;
  if (changesRequestedCount > 0) {
    summaryText = `${changesRequestedCount}명이 수정을 요청했습니다.`;
  } else if (pendingCount > 0) {
    summaryText = `${pendingCount}명의 처리가 남아있습니다.`;
  } else {
    summaryText = "모든 담당자가 처리했습니다.";
  }

  return (
    <div className="overflow-hidden rounded-lg border-2 border-amber-300/50">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between bg-amber-50/50 px-4 py-3 text-left transition-colors hover:bg-amber-50/80"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-100">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {stage.label} — {approvedCount}/{totalCount} 승인 완료
            </p>
            <p className="text-xs text-muted-foreground">{summaryText}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {expanded ? (
        <div className="border-t border-amber-200/50">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{pickerLabel}</span>
              {picker ? (
                <MemberPickerSection
                  label=""
                  applyLabel={`${pickerLabel} 적용`}
                  availableMembers={picker.availableMembers}
                  selectedIds={picker.selectedIds}
                  displayItems={[]}
                  onSync={picker.onSync}
                  onRequestMembers={picker.onRequest}
                  onSearchChange={picker.onSearchChange}
                  isSearching={picker.isSearching}
                  isUpdating={picker.isUpdating}
                />
              ) : null}
            </div>
            {stage.assignees.length > 0 ? (
              stage.assignees.map((assignee) => (
                <GateCardAssigneeRow key={assignee.id} assignee={assignee} />
              ))
            ) : (
              <p className="py-2 text-xs text-muted-foreground">{pickerLabel}가 아직 지정되지 않았습니다.</p>
            )}
          </div>

          {/* 코멘트 입력 (반려/수정요청 시) */}
          {actionMode !== "none" ? (
            <div className="border-t px-4 py-3">
              <p className="mb-2 text-xs font-medium text-foreground">
                {actionMode === "reject" ? "반려 사유" : "수정 요청 사항"}
              </p>
              <Input
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder={actionMode === "reject" ? "반려 사유를 입력하세요..." : "수정이 필요한 사항을 입력하세요..."}
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setActionMode("none"); setActionComment(""); }}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  variant={actionMode === "reject" ? "destructive" : "default"}
                  disabled={isActionPending}
                  onClick={() => {
                    if (!currentUserStepId) return;
                    if (actionMode === "reject") {
                      onStepReject?.(currentUserStepId, actionComment || undefined);
                    } else {
                      onStepRequestChanges?.(currentUserStepId, actionComment || undefined);
                    }
                    setActionMode("none");
                    setActionComment("");
                  }}
                >
                  {isActionPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  {actionMode === "reject" ? "반려 확인" : "수정 요청 확인"}
                </Button>
              </div>
            </div>
          ) : null}

          {/* 액션 버튼 */}
          {actionMode === "none" ? (
            <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-4 py-3">
              {/* 현재 사용자가 PENDING step 담당자 */}
              {canAct && onStepReject ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isActionPending}
                  onClick={(e) => { e.stopPropagation(); setActionMode("reject"); }}
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  반려
                </Button>
              ) : null}
              {canAct && onStepRequestChanges ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isActionPending}
                  onClick={(e) => { e.stopPropagation(); setActionMode("request-changes"); }}
                >
                  <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                  수정 요청
                </Button>
              ) : null}
              {canAct && onStepApprove && currentUserStepId ? (
                <Button
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700"
                  disabled={isActionPending}
                  onClick={(e) => { e.stopPropagation(); onStepApprove(currentUserStepId); }}
                >
                  {isActionPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  승인
                </Button>
              ) : null}

              {/* EC 작성자 + CHANGES_REQUESTED step 존재 → 재제출 */}
              {!canAct && isEcCreator && changesRequestedSteps.length > 0 && onStepResubmit ? (
                changesRequestedSteps.map((step) => (
                  <Button
                    key={step.id}
                    size="sm"
                    disabled={isActionPending}
                    onClick={(e) => { e.stopPropagation(); onStepResubmit(step.id); }}
                  >
                    {isActionPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                    {step.name} 재제출
                  </Button>
                ))
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
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
  workflowData,
  workflowStagePicker,
  isCreatingComment = false,
  isError = false,
  isLoading = false,
  isMergingEngineeringChange = false,
  isNotFound = false,
  isReopeningEngineeringChange = false,
  isSavingEngineeringChange = false,
  isStepActionPending = false,
  isSubmittingEngineeringChange = false,
  currentUserStepId,
  isEcCreator = false,
  isTimelineLoading = false,
  affectedItemPicker,
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
  onMergeEngineeringChange,
  onStepApprove,
  onStepReject,
  onStepRequestChanges,
  onStepResubmit,
  onNavigateToIssue,
  onNavigateToIssueMention,
  onReopenEngineeringChange,
  onRetry,
  onSaveEngineeringChange,
  onSubmitEngineeringChange,
  onTabChange,
  onUpdateComment,
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

  const ecState = engineeringChange.engineeringChangeState;
  const canSubmit = ecState === "DRAFT";
  const canApproveReview = ecState === "REVIEW_PENDING";
  const canApprove = ecState === "APPROVAL_PENDING";
  const canRelease = ecState === "RELEASE_PENDING";
  const canAdvance = canApproveReview || canApprove || canRelease;
  const canClose = ecState !== "RELEASED" && ecState !== "CANCELED";
  const canReopen = false;
  const isEditable = ecState !== "RELEASED" && ecState !== "CANCELED";

  const advanceLabel = canApprove ? "승인" : canRelease ? "반영" : "검토 승인";
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
        {headerAccessory && !workflowData ? <div className="mt-4">{headerAccessory}</div> : null}
      </div>

      {workflowData && canSubmit ? (
        <div className="mt-4">
          <WorkflowStepRailAccordion
            stages={workflowData.stages}
            stagePicker={workflowStagePicker}
          />
        </div>
      ) : null}

      {workflowData && !canSubmit ? (
        <div className="mt-4">
          <WorkflowSummaryBar stages={workflowData.stages} ecState={ecState} />
        </div>
      ) : null}

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

              {/* 게이트 카드 — 활성 단계가 있을 때만 (제출 이후) */}
              {workflowData ? (() => {
                const activeStage = workflowData.stages.find((s) => s.status === "active");

                if (activeStage && !canSubmit) {
                  return (
                    <WorkflowGateCard
                      stage={activeStage}
                      isActionPending={isStepActionPending}
                      currentUserStepId={currentUserStepId}
                      isEcCreator={isEcCreator}
                      onStepApprove={onStepApprove}
                      onStepReject={onStepReject}
                      onStepRequestChanges={onStepRequestChanges}
                      onStepResubmit={onStepResubmit}
                      picker={workflowStagePicker ? {
                        availableMembers: workflowStagePicker.availableMembers,
                        selectedIds: activeStage.assignees.map((a) => a.assigneeId ?? a.id),
                        onRequest: workflowStagePicker.onRequest,
                        onSearchChange: workflowStagePicker.onSearchChange,
                        onSync: (userIds) => {
                          const stages = (workflowData?.stages ?? []).map((s) => ({
                            stageType: s.type,
                            stageId: s.stageId,
                            completionPolicy: s.completionPolicy ?? ("ALL_MUST_APPROVE" as EngineeringChangeCompletionPolicy),
                            minApprovals: s.minApprovals,
                            deadline: s.deadline,
                            assignees: s.type === activeStage.type
                              ? userIds.map((id) => ({ id, type: "USER" as const }))
                              : s.assignees.map((a) => ({ id: a.assigneeId ?? a.id, type: a.type })),
                          }));
                          workflowStagePicker.onSyncStages(stages);
                        },
                        isSearching: workflowStagePicker.isSearching,
                        isUpdating: workflowStagePicker.isUpdating,
                      } : undefined}
                    />
                  );
                }

                return null;
              })() : null}

              {/* 댓글 입력 */}
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
                          onClick={() => { void onSubmitEngineeringChange(); }}
                        >
                          {isSubmittingEngineeringChange ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <FileCheck className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          제출
                        </Button>
                      ) : null}
                      {!workflowData?.stages.some((s) => s.status === "active") && canAdvance ? (
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                          disabled={isMergingEngineeringChange}
                          onClick={() => { void onMergeEngineeringChange(); }}
                        >
                          {isMergingEngineeringChange ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          {advanceLabel}
                        </Button>
                      ) : null}
                      {canReopen ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isReopeningEngineeringChange}
                          onClick={() => { void onReopenEngineeringChange(); }}
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
                affectedItemPicker={affectedItemPicker}
                labelPicker={labelPicker}
                linkedIssuePicker={linkedIssuePicker}
                isAttachingFiles={isAttachingFiles}
                onAttachFiles={onAttachFiles}
                onDeleteFile={onDeleteFile}
                onEditIssues={onEditIssues}
                onEditLabels={onEditLabels}
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
