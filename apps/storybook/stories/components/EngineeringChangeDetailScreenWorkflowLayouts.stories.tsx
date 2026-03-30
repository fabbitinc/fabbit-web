import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import { EngineeringChangeDetailScreen, type EngineeringChangeWorkflowData } from "@fabbit/components";
import { UserAvatar } from "@fabbit/ui";

type WorkflowStage = EngineeringChangeWorkflowData["stages"][number];
type WorkflowAssignee = WorkflowStage["assignees"][number];

const workflow: EngineeringChangeWorkflowData = {
  stages: [
    {
      id: "review",
      label: "검토",
      type: "REVIEW",
      status: "completed",
      description: "설계, 생산기술, 품질 검토",
      assignees: [
        {
          id: "user-2",
          name: "김서윤",
          type: "USER",
          status: "APPROVED",
          actedAt: "2026-03-06T10:20:00.000Z",
          actedByName: "김서윤",
          subtitle: "회로 설계",
        },
        {
          id: "user-3",
          name: "박지후",
          type: "USER",
          status: "APPROVED",
          actedAt: "2026-03-06T10:55:00.000Z",
          actedByName: "박지후",
          subtitle: "생산기술",
        },
      ],
    },
    {
      id: "approval",
      label: "승인",
      type: "APPROVAL",
      status: "active",
      description: "CCB 결재",
      assignees: [
        {
          id: "team-1",
          name: "품질팀",
          type: "TEAM",
          status: "PENDING",
          subtitle: "팀 합의 필요",
        },
        {
          id: "user-4",
          name: "정이사",
          type: "USER",
          status: "PENDING",
          subtitle: "최종 승인",
        },
      ],
    },
    {
      id: "release",
      label: "반영",
      type: "RELEASE",
      status: "pending",
      description: "BOM/도면 릴리즈",
      assignees: [
        {
          id: "user-5",
          name: "이도윤",
          type: "USER",
          status: "PENDING",
          subtitle: "PLM 관리자",
        },
      ],
    },
  ],
};

const engineeringChangeBase = {
  title: "PCB 커넥터 핀 배열 변경",
  number: 15,
  engineeringChangeState: "APPROVAL_PENDING",
  commentsCount: 2,
  createdAt: "2026-03-06T09:40:00.000Z",
  updatedAt: "2026-03-06T11:50:00.000Z",
  mergedAt: null,
  mergedBy: null,
  body: "<p>PCB 커넥터 핀 배열을 변경해 조립 공차를 줄이는 요청입니다.</p>",
  isModified: true,
  createdBy: {
    fullName: "문성하",
    profileImageUrl: null,
  },
  assignees: [],
  reviewers: [],
  labels: [
    {
      id: "label-1",
      name: "배선",
      color: "#4F46E5",
    },
  ],
  parts: [
    {
      id: "part-1",
      partNumber: "PCB-9201",
      name: "컨트롤 보드",
    },
  ],
  files: [
    {
      fileId: "file-1",
      originalName: "pin-layout-diff.pdf",
      contentType: "application/pdf",
      fileSize: 412000,
      fileUrl: "https://example.com/pin-layout-diff.pdf",
      createdAt: "2026-03-06T10:15:00.000Z",
    },
  ],
  linkedIssues: [
    {
      id: "issue-42",
      number: 42,
      title: "센서 모듈 하우징 간섭 이슈",
      state: "OPEN",
    },
  ],
};

function formatActionTime(actedAt?: string | null) {
  if (!actedAt) {
    return "대기";
  }

  return new Date(actedAt).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getStageStateLabel(stage: WorkflowStage) {
  if (stage.status === "completed") {
    return "완료";
  }

  if (stage.status === "active") {
    return "진행중";
  }

  return "대기";
}

function getAssigneeStateLabel(assignee: WorkflowAssignee) {
  if (assignee.status === "APPROVED") {
    return "완료";
  }

  if (assignee.status === "REJECTED") {
    return "반려";
  }

  return "대기";
}

function getStageCardClassName(stage: WorkflowStage, compact = false) {
  const base = compact ? "rounded-lg border bg-card" : "rounded-xl border bg-card";

  if (stage.status === "active") {
    return `${base} border-foreground/25 bg-muted/20`;
  }

  return base;
}

function getStageWaitingSummary(stage: WorkflowStage) {
  const pendingAssignees = stage.assignees.filter((assignee) => assignee.status === "PENDING");

  if (pendingAssignees.length === 0) {
    return "처리 완료";
  }

  return `${pendingAssignees.map((assignee) => assignee.name).join(", ")} 대기`;
}

function WideStepRail({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  const currentIndex = workflow.stages.findIndex((stage) => stage.status === "active");

  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-0">
            {workflow.stages.map((stage, index) => {
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
                      <p
                        className={`truncate text-sm font-medium ${
                          isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {stage.label}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">{stage.description}</p>
                    </div>
                  </div>

                  {index < workflow.stages.length - 1 ? (
                    <div className="mx-4 h-px flex-1 bg-muted-foreground/30">
                      <div className={`h-full ${isCompleted ? "bg-primary" : "bg-transparent"}`} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          {expanded ? "접기" : "펼치기"}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

function AssigneeRow({
  assignee,
  compact = false,
}: {
  assignee: WorkflowAssignee;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "py-2" : "py-2.5"}`}>
      <UserAvatar name={assignee.name} className={compact ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-[10px]"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-xs font-medium text-foreground">{assignee.name}</span>
          <span className="text-[11px] text-muted-foreground">{getAssigneeStateLabel(assignee)}</span>
        </div>
        <p className="truncate text-[11px] text-muted-foreground">{assignee.subtitle ?? "역할 미지정"}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[11px] font-medium text-foreground">{formatActionTime(assignee.actedAt)}</p>
        <p className="text-[10px] text-muted-foreground">{assignee.actedAt ? "처리시간" : "담당 대기"}</p>
      </div>
    </div>
  );
}

function StageSummaryFooter({ stage }: { stage: WorkflowStage }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-muted-foreground">step 상태</span>
      <span className="text-[11px] font-medium text-foreground">{getStageWaitingSummary(stage)}</span>
    </div>
  );
}

function StageCard({
  stage,
  compact = false,
  footer,
}: {
  stage: WorkflowStage;
  compact?: boolean;
  footer?: ReactNode;
}) {
  return (
    <div className={getStageCardClassName(stage, compact)}>
      <div className={compact ? "px-4 py-3" : "px-4 py-4"}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{stage.label}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{stage.description}</p>
          </div>
          <div className="rounded-md border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {getStageStateLabel(stage)}
          </div>
        </div>
      </div>
      <div className="border-t px-4 py-2">
        {stage.assignees.map((assignee, index) => (
          <div key={assignee.id} className={index > 0 ? "border-t" : ""}>
            <AssigneeRow assignee={assignee} compact={compact} />
          </div>
        ))}
      </div>
      {footer ? <div className="border-t px-4 py-2.5">{footer}</div> : null}
    </div>
  );
}

function HeaderSummaryBody() {
  return (
    <div className="grid gap-3 xl:grid-cols-3">
      {workflow.stages.map((stage) => (
        <StageCard key={stage.id} stage={stage} footer={<StageSummaryFooter stage={stage} />} />
      ))}
    </div>
  );
}

function ShiftBoardBody() {
  return (
    <div className="grid gap-3">
      {workflow.stages.map((stage) => (
        <div key={stage.id} className={getStageCardClassName(stage)}>
          <div className="grid gap-0 xl:grid-cols-[180px_1fr]">
            <div className="border-b px-4 py-4 xl:border-b-0 xl:border-r">
              <p className="text-sm font-semibold text-foreground">{stage.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{getStageStateLabel(stage)}</p>
            </div>
            <div className="px-4 py-2">
              {stage.assignees.map((assignee, index) => (
                <div key={assignee.id} className={index > 0 ? "border-t" : ""}>
                  <AssigneeRow assignee={assignee} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

type LayoutVariant = "header-summary" | "shift-board";

function WorkflowHeader({ variant }: { variant: LayoutVariant }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="space-y-3">
      <WideStepRail expanded={expanded} onToggle={() => setExpanded((previous) => !previous)} />
      {expanded ? (variant === "shift-board" ? <ShiftBoardBody /> : <HeaderSummaryBody />) : null}
    </div>
  );
}

function EngineeringChangeDetailScreenWorkflowStory({ variant }: { variant: LayoutVariant }) {
  const [activeTab, setActiveTab] = useState("conversation");

  return (
    <EngineeringChangeDetailScreen
      engineeringChange={{
        ...engineeringChangeBase,
        workflow: undefined,
      }}
      activeTab={activeTab}
      headerAccessory={<WorkflowHeader variant={variant} />}
      tabs={[
        { id: "conversation", label: "대화" },
        { id: "changes", label: "변경 내용" },
      ]}
      timelineItems={[
        {
          kind: "event",
          id: "event-1",
          event: {
            id: "event-1",
            type: "cr_created",
            author: {
              name: "문성하",
              profileImageUrl: null,
            },
            createdAtLabel: "3시간 전",
          },
        },
        {
          kind: "comment",
          id: "comment-1",
          author: {
            fullName: "문성하",
            profileImageUrl: null,
          },
          authorId: "user-1",
          body: "<p>핀 간격을 0.8mm에서 1.0mm로 넓히는 안을 제안합니다.</p>",
          createdAt: "2026-03-06T10:30:00.000Z",
          isModified: false,
          updatedAt: "2026-03-06T10:30:00.000Z",
        },
      ]}
      commentCount={1}
      currentUser={{
        id: "user-1",
        name: "문성하",
        profileImageUrl: null,
      }}
      onBack={() => undefined}
      onRetry={() => undefined}
      onTabChange={setActiveTab}
      labelPicker={{
        availableLabels: [
          { id: "label-1", name: "배선", colorHex: "#4F46E5" },
          { id: "label-2", name: "검토 필요", colorHex: "#F97316" },
        ],
        selectedIds: ["label-1"],
        onRequest: () => undefined,
        onSync: () => undefined,
      }}
      partPicker={{
        searchedParts: [
          { id: "part-1", partNumber: "PCB-9201", name: "컨트롤 보드" },
          { id: "part-2", partNumber: "CBL-1022", name: "신호 케이블" },
        ],
        selectedIds: ["part-1"],
        onRequest: () => undefined,
        onSearchChange: () => undefined,
        onSync: () => undefined,
      }}
      linkedIssuePicker={{
        availableIssues: [
          { id: "issue-42", number: 42, title: "센서 모듈 하우징 간섭 이슈", state: "OPEN" },
          { id: "issue-78", number: 78, title: "브라켓 홀 위치 오차", state: "CLOSED" },
        ],
        selectedIds: ["issue-42"],
        onRequest: () => undefined,
        onSearchChange: () => undefined,
        onSync: () => undefined,
      }}
      onSaveEngineeringChange={async () => undefined}
      onCreateComment={async () => undefined}
      onUpdateComment={async () => undefined}
      onDeleteComment={async () => undefined}
      onSubmitEngineeringChange={() => undefined}
      onMergeEngineeringChange={() => undefined}
      onCloseEngineeringChange={() => undefined}
      onReopenEngineeringChange={() => undefined}
      onNavigateToIssueMention={() => undefined}
      onNavigateToIssue={() => undefined}
      onAttachFiles={async () => undefined}
      onDeleteFile={async () => undefined}
    />
  );
}

const meta = {
  title: "Components/EngineeringChangeDetailScreen/WorkflowLayouts",
  component: EngineeringChangeDetailScreenWorkflowStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof EngineeringChangeDetailScreenWorkflowStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HeaderSummary: Story = {
  args: {
    variant: "header-summary",
  },
};

export const ShiftBoard: Story = {
  args: {
    variant: "shift-board",
  },
};
