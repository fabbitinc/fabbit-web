import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  EngineeringChangeStatusBadge,
  StepIndicator,
  type EngineeringChangeWorkflowData,
} from "@fabbit/components";
import { Badge, Button, UserAvatar, WorkflowStepper, type WorkflowStep } from "@fabbit/ui";

interface WorkflowPreviewContext {
  number: number;
  state: string;
  title: string;
  summary: string;
  impact: string;
  dueLabel: string;
}

const previewContext: WorkflowPreviewContext = {
  number: 15,
  state: "APPROVAL_PENDING",
  title: "PCB 커넥터 핀 배열 변경",
  summary: "조립 공차를 줄이기 위해 핀 간격을 0.8mm에서 1.0mm로 조정하는 변경 요청입니다.",
  impact: "생산기술, 품질, BOM 릴리즈 영향",
  dueLabel: "오늘 17:00 전 승인 필요",
};

const workflow: EngineeringChangeWorkflowData = {
  stages: [
    {
      id: "review",
      label: "기술 검토",
      type: "REVIEW",
      status: "completed",
      description: "설계, 생산기술, 품질 검토",
      assignees: [
        {
          id: "user-1",
          name: "박시우",
          type: "USER",
          status: "APPROVED",
          actedAt: "2026-03-07T01:20:00Z",
          actedByName: "박시우",
          subtitle: "회로 설계",
        },
        {
          id: "user-2",
          name: "박지후",
          type: "USER",
          status: "APPROVED",
          actedAt: "2026-03-07T03:20:00Z",
          actedByName: "박지후",
          subtitle: "생산기술",
        },
      ],
    },
    {
      id: "approval",
      label: "변경 승인",
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
          id: "user-3",
          name: "정이사",
          type: "USER",
          status: "PENDING",
          subtitle: "최종 승인",
        },
      ],
    },
    {
      id: "release",
      label: "시스템 반영",
      type: "RELEASE",
      status: "pending",
      description: "BOM/도면 릴리즈",
      assignees: [
        {
          id: "user-4",
          name: "이도윤",
          type: "USER",
          status: "PENDING",
          subtitle: "PLM 관리자",
        },
      ],
    },
  ],
};

function getCurrentStage(workflowData: EngineeringChangeWorkflowData) {
  return workflowData.stages.find((stage) => stage.status === "active") ?? workflowData.stages[workflowData.stages.length - 1];
}

function getPendingAssignees(workflowData: EngineeringChangeWorkflowData) {
  return workflowData.stages.flatMap((stage) =>
    stage.assignees
      .filter((assignee) => assignee.status === "PENDING")
      .map((assignee) => ({ ...assignee, stageLabel: stage.label })),
  );
}

function getCompletedCount(workflowData: EngineeringChangeWorkflowData) {
  return workflowData.stages.filter((stage) => stage.status === "completed").length;
}

function toIndicatorSteps(workflowData: EngineeringChangeWorkflowData) {
  return workflowData.stages.map((stage) => ({
    id: stage.id,
    label: stage.label,
    description: stage.description,
  }));
}

function toWorkflowSteps(workflowData: EngineeringChangeWorkflowData): WorkflowStep[] {
  return workflowData.stages.map((stage) => ({
    id: stage.id,
    label: stage.label,
    status: stage.status,
    children: (
      <div className="space-y-1.5">
        {stage.assignees.map((assignee) => (
          <div key={assignee.id} className="flex items-center gap-2 rounded-md border bg-background/80 px-2.5 py-2">
            <UserAvatar name={assignee.name} className="h-6 w-6 text-[10px]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{assignee.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{assignee.subtitle ?? stage.description}</p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {assignee.status === "APPROVED" ? "완료" : assignee.status === "REJECTED" ? "반려" : "대기"}
            </Badge>
          </div>
        ))}
      </div>
    ),
  }));
}

function StagePills({ workflowData }: { workflowData: EngineeringChangeWorkflowData }) {
  return (
    <div className="flex flex-wrap gap-2">
      {workflowData.stages.map((stage, index) => (
        <div
          key={stage.id}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            stage.status === "active"
              ? "border-primary bg-primary text-primary-foreground"
              : stage.status === "completed"
                ? "border-border bg-background text-foreground"
                : "border-dashed border-border bg-muted/50 text-muted-foreground"
          }`}
        >
          {index + 1}. {stage.label}
        </div>
      ))}
    </div>
  );
}

function PendingAssigneeStack({ workflowData }: { workflowData: EngineeringChangeWorkflowData }) {
  const pendingAssignees = getPendingAssignees(workflowData);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pendingAssignees.map((assignee) => (
        <div key={`${assignee.stageLabel}-${assignee.id}`} className="flex items-center gap-2 rounded-full border bg-background px-2 py-1">
          <UserAvatar name={assignee.name} className="h-5 w-5 text-[9px]" />
          <span className="text-[11px] font-medium text-foreground">{assignee.name}</span>
          <span className="text-[11px] text-muted-foreground">{assignee.stageLabel}</span>
        </div>
      ))}
    </div>
  );
}

function MockConversationPanel() {
  return (
    <div className="space-y-3 rounded-2xl border bg-background p-4">
      <div className="rounded-xl border bg-muted/40 p-4">
        <p className="text-sm font-medium text-foreground">변경 배경</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          생산 라인에서 커넥터 삽입 편차가 반복되어 핀 배열 간격과 조립 지그 기준선을 함께 수정합니다.
        </p>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm font-medium text-foreground">최근 코멘트</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          품질팀에서 재검증 요청은 없고, 승인 후 오늘 릴리즈까지 바로 이어가면 됩니다.
        </p>
      </div>
    </div>
  );
}

function HeaderLiftedLayout() {
  const currentStage = getCurrentStage(workflow);

  return (
    <div className="mx-auto max-w-6xl rounded-[28px] border bg-card p-6 shadow-sm">
      <div className="rounded-[24px] border bg-[linear-gradient(135deg,var(--background),var(--muted))] p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <EngineeringChangeStatusBadge state={previewContext.state} />
                <Badge variant="outline">#{previewContext.number}</Badge>
                <Badge variant="outline">{previewContext.impact}</Badge>
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{previewContext.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{previewContext.summary}</p>
              </div>
            </div>
            <div className="min-w-[260px] rounded-2xl border bg-background/80 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Current Step</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{currentStage?.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{previewContext.dueLabel}</p>
              <div className="mt-4">
                <PendingAssigneeStack workflowData={workflow} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border bg-background/80 px-4 py-3">
            <StepIndicator
              steps={toIndicatorSteps(workflow)}
              currentStepId={currentStage?.id ?? workflow.stages[0]?.id ?? ""}
            />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <MockConversationPanel />
      </div>
    </div>
  );
}

function CommandRibbonLayout() {
  const currentStage = getCurrentStage(workflow);
  const completedCount = getCompletedCount(workflow);

  return (
    <div className="mx-auto max-w-6xl rounded-[28px] border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-5 py-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">변경 진행바</Badge>
            <span className="text-sm font-medium text-foreground">{previewContext.title}</span>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{workflow.stages.length} 단계 완료
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{currentStage?.label}</Badge>
            <Badge variant="outline">{previewContext.dueLabel}</Badge>
            <Button size="sm">승인 요청 확인</Button>
          </div>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border bg-background p-4">
            <StagePills workflowData={workflow} />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{previewContext.summary}</p>
          </div>
          <div className="rounded-2xl border bg-background p-4">
            <p className="text-xs font-medium text-muted-foreground">다음 처리자</p>
            <div className="mt-3">
              <PendingAssigneeStack workflowData={workflow} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSpotlightLayout() {
  const currentStage = getCurrentStage(workflow);

  return (
    <div className="mx-auto max-w-6xl rounded-[32px] border bg-card p-6 shadow-sm">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="rounded-[28px] border bg-[radial-gradient(circle_at_top_left,var(--muted),var(--background)_55%)] p-6">
          <div className="flex flex-wrap items-center gap-2">
            <EngineeringChangeStatusBadge state={previewContext.state} />
            <Badge variant="outline">헤더 승격안</Badge>
          </div>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight text-foreground">{previewContext.title}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{previewContext.summary}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Current</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{currentStage?.label}</p>
            </div>
            <div className="rounded-2xl border bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Impact</p>
              <p className="mt-2 text-sm font-medium text-foreground">{previewContext.impact}</p>
            </div>
            <div className="rounded-2xl border bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Deadline</p>
              <p className="mt-2 text-sm font-medium text-foreground">{previewContext.dueLabel}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] border bg-background p-5">
          <p className="text-xs font-medium text-muted-foreground">결정 패널</p>
          <div className="mt-4">
            <WorkflowStepper steps={toWorkflowSteps(workflow)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitDecisionBoardLayout() {
  const currentStage = getCurrentStage(workflow);

  return (
    <div className="mx-auto max-w-6xl rounded-[28px] border bg-card p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-[24px] border bg-muted/20 p-4">
          <p className="text-xs font-medium text-muted-foreground">진행 보드</p>
          <div className="mt-4 space-y-3">
            {workflow.stages.map((stage, index) => (
              <div
                key={stage.id}
                className={`rounded-2xl border px-4 py-3 ${
                  stage.status === "active" ? "border-primary bg-primary/10" : "bg-background"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {index + 1}. {stage.label}
                  </span>
                  <Badge variant="outline">
                    {stage.status === "completed" ? "완료" : stage.status === "active" ? "진행" : "예정"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[24px] border bg-background p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <EngineeringChangeStatusBadge state={previewContext.state} />
                  <Badge variant="outline">#{previewContext.number}</Badge>
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-foreground">{previewContext.title}</h2>
              </div>
              <div className="rounded-2xl border bg-muted/30 px-4 py-3">
                <p className="text-[11px] font-medium text-muted-foreground">지금 필요한 행동</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{currentStage?.label} 승인 확보</p>
              </div>
            </div>
          </div>
          <MockConversationPanel />
        </div>
      </div>
    </div>
  );
}

function FloatingDockLayout() {
  const currentStage = getCurrentStage(workflow);

  return (
    <div className="mx-auto max-w-6xl rounded-[28px] border bg-card p-6 shadow-sm">
      <div className="rounded-[28px] border bg-background p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <EngineeringChangeStatusBadge state={previewContext.state} />
                <Badge variant="outline">플로팅 도크안</Badge>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-foreground">{previewContext.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{previewContext.summary}</p>
            </div>
            <Button size="sm">현재 단계 상세 보기</Button>
          </div>
          <MockConversationPanel />
        </div>
      </div>
      <div className="-mt-5 flex justify-center">
        <div className="w-full max-w-4xl rounded-[22px] border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">현재 단계</Badge>
              <span className="text-sm font-semibold text-foreground">{currentStage?.label}</span>
              <span className="text-sm text-muted-foreground">{previewContext.dueLabel}</span>
            </div>
            <PendingAssigneeStack workflowData={workflow} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExplorationGallery() {
  return (
    <div className="space-y-10 bg-muted/20 p-6">
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Variant A</p>
        <HeaderLiftedLayout />
      </section>
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Variant B</p>
        <CommandRibbonLayout />
      </section>
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Variant C</p>
        <HeroSpotlightLayout />
      </section>
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Variant D</p>
        <SplitDecisionBoardLayout />
      </section>
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Variant E</p>
        <FloatingDockLayout />
      </section>
    </div>
  );
}

const meta = {
  title: "Components/EngineeringChangeWorkflowExplorations",
  component: ExplorationGallery,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ExplorationGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HeaderLifted: Story = {
  args: {},
  render: () => <HeaderLiftedLayout />,
};

export const CommandRibbon: Story = {
  args: {},
  render: () => <CommandRibbonLayout />,
};

export const HeroSpotlight: Story = {
  args: {},
  render: () => <HeroSpotlightLayout />,
};

export const SplitDecisionBoard: Story = {
  args: {},
  render: () => <SplitDecisionBoardLayout />,
};

export const FloatingDock: Story = {
  args: {},
  render: () => <FloatingDockLayout />,
};

export const Showcase: Story = {
  args: {},
  render: () => <ExplorationGallery />,
};
