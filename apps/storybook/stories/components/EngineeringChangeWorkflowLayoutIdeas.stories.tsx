import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, CheckCircle2, ChevronDown, ChevronUp, Clock, MessageSquare, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge, Button, UserAvatar } from "@fabbit/ui";
import type { EngineeringChangeWorkflowData } from "@fabbit/components";

// --- 공통 mock 데이터 ---

type WorkflowStage = EngineeringChangeWorkflowData["stages"][number];
type WorkflowAssignee = WorkflowStage["assignees"][number];

const workflow: EngineeringChangeWorkflowData = {
  stages: [
    {
      id: "review",
      label: "기술 검토",
      type: "REVIEW",
      status: "active",
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
          status: "PENDING",
          subtitle: "생산기술",
        },
      ],
    },
    {
      id: "approval",
      label: "변경 승인",
      type: "APPROVAL",
      status: "pending",
      description: "CCB 결재",
      assignees: [
        { id: "team-1", name: "품질팀", type: "TEAM", status: "PENDING", subtitle: "팀 합의 필요" },
      ],
    },
    {
      id: "release",
      label: "시스템 반영",
      type: "RELEASE",
      status: "pending",
      description: "BOM/도면 릴리즈",
      assignees: [
        { id: "user-4", name: "이도윤", type: "USER", status: "PENDING", subtitle: "PLM 관리자" },
      ],
    },
  ],
};

const activeStage = workflow.stages.find((s) => s.status === "active")!;

const mockComments = [
  {
    id: "c1",
    author: "문성하",
    time: "3시간 전",
    body: "핀 간격을 0.8mm에서 1.0mm로 넓히는 안을 제안합니다.",
  },
  {
    id: "c2",
    author: "김서윤",
    time: "2시간 전",
    body: "조립 공차 개선 효과 확인했습니다. 1.0mm 안에 동의합니다.",
  },
];

const mockEvents = [
  { id: "e1", text: "문성하님이 변경관리를 생성했습니다.", time: "4시간 전" },
  { id: "e2", text: "김서윤님이 기술 검토를 승인했습니다.", time: "2시간 전" },
];

// --- 공통 UI 조각 ---

function StatusBadge() {
  return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-600">
      <Clock className="mr-1 h-3 w-3" />
      검토중
    </Badge>
  );
}

function MiniProgress({ stages }: { stages: WorkflowStage[] }) {
  const currentIndex = stages.findIndex((s) => s.status === "active");

  return (
    <div className="flex items-center gap-0">
      {stages.map((stage, index) => {
        const done = currentIndex >= 0 ? index < currentIndex : stage.status === "completed";
        const active = currentIndex >= 0 ? index === currentIndex : stage.status === "active";

        return (
          <div key={stage.id} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : index + 1}
              </div>
              <span
                className={`text-xs font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}
              >
                {stage.label}
              </span>
            </div>
            {index < stages.length - 1 ? (
              <div className="mx-2 h-px w-6 bg-muted-foreground/30">
                <div className={`h-full ${done ? "bg-primary" : ""}`} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function CommentItem({ author, time, body }: { author: string; time: string; body: string }) {
  return (
    <div className="flex gap-3">
      <UserAvatar name={author} className="h-8 w-8 shrink-0" />
      <div className="min-w-0 flex-1 rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
          <span className="text-sm font-medium">{author}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <div className="px-4 py-3 text-sm">{body}</div>
      </div>
    </div>
  );
}

function TimelineEvent({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      <span>{text}</span>
      <span>·</span>
      <span>{time}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function AssigneeStatus({ assignee }: { assignee: WorkflowAssignee }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <UserAvatar name={assignee.name} className="h-6 w-6 text-[10px]" />
      <span className="text-sm font-medium">{assignee.name}</span>
      <span className="text-xs text-muted-foreground">{assignee.subtitle}</span>
      {assignee.status === "APPROVED" ? (
        <Badge variant="outline" className="ml-auto border-green-200 bg-green-50 text-green-600 text-[10px]">
          승인
        </Badge>
      ) : (
        <Badge variant="outline" className="ml-auto text-[10px]">대기</Badge>
      )}
    </div>
  );
}

function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[900px] p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{title}</p>
      <div className="rounded-xl border bg-background p-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Header() {
  return (
    <div className="px-6 pt-6">
      <h2 className="text-xl font-bold">
        PCB 커넥터 핀 배열 변경 <span className="font-normal text-muted-foreground">#15</span>
      </h2>
      <div className="mt-2 flex items-center gap-2">
        <StatusBadge />
        <span className="text-sm text-muted-foreground">2026년 3월 6일 생성</span>
        <span className="text-sm text-muted-foreground">·</span>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          댓글 2개
        </span>
      </div>
    </div>
  );
}

function CommentInput({ actionLabel }: { actionLabel: string }) {
  return (
    <div className="flex gap-3">
      <UserAvatar name="나" className="h-8 w-8 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">댓글을 작성하세요...</p>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button size="sm" variant="outline">
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            변경관리 닫기
          </Button>
          <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            {actionLabel}
          </Button>
          <Button size="sm">댓글</Button>
        </div>
      </div>
    </div>
  );
}

// ===== 방향 A: 타임라인 인라인 액션 카드 =====

function LayoutA() {
  return (
    <PageShell title="방향 A — 타임라인 인라인 액션 카드">
      <Header />
      <div className="px-6 py-5 space-y-4">
        {/* 타임라인 */}
        <TimelineEvent text={mockEvents[0].text} time={mockEvents[0].time} />
        <CommentItem {...mockComments[0]} />
        <TimelineEvent text={mockEvents[1].text} time={mockEvents[1].time} />
        <CommentItem {...mockComments[1]} />

        {/* 워크플로우 액션 카드 (타임라인 안에 삽입) */}
        <div className="rounded-lg border-2 border-amber-300/50 bg-amber-50/30">
          <div className="flex items-center justify-between border-b border-amber-200/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary text-xs font-bold text-primary">
                1
              </div>
              <span className="text-sm font-semibold">기술 검토</span>
              <span className="text-xs text-muted-foreground">1/2 완료</span>
            </div>
            <MiniProgress stages={workflow.stages} />
          </div>
          <div className="px-4 py-3 space-y-1">
            {activeStage.assignees.map((a) => (
              <AssigneeStatus key={a.id} assignee={a} />
            ))}
          </div>
        </div>

        {/* 댓글 입력 */}
        <CommentInput actionLabel="검토 승인" />
      </div>
    </PageShell>
  );
}

// ===== 방향 B: 고정 액션 바 + 축소된 진행 표시 =====

function LayoutB() {
  return (
    <PageShell title="방향 B — 고정 액션 바 + 한 줄 프로그레스">
      <Header />
      {/* 한 줄 프로그레스 바 */}
      <div className="mt-4 border-y bg-muted/20 px-6 py-2.5">
        <div className="flex items-center justify-between">
          <MiniProgress stages={workflow.stages} />
          <span className="text-xs text-muted-foreground">박지후 검토 대기</span>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        <TimelineEvent text={mockEvents[0].text} time={mockEvents[0].time} />
        <CommentItem {...mockComments[0]} />
        <TimelineEvent text={mockEvents[1].text} time={mockEvents[1].time} />
        <CommentItem {...mockComments[1]} />

        {/* 댓글 입력 + 액션 버튼이 하단에 통합 */}
        <CommentInput actionLabel="검토 승인" />
      </div>
    </PageShell>
  );
}

// ===== 방향 C: 현재 단계 섹션을 댓글 위에 배치 =====

function LayoutC() {
  return (
    <PageShell title="방향 C — 현재 단계 섹션을 댓글 위에 배치">
      <Header />
      <div className="mt-4 px-6">
        <MiniProgress stages={workflow.stages} />
      </div>
      <div className="px-6 py-5 space-y-4">
        <TimelineEvent text={mockEvents[0].text} time={mockEvents[0].time} />
        <CommentItem {...mockComments[0]} />
        <TimelineEvent text={mockEvents[1].text} time={mockEvents[1].time} />
        <CommentItem {...mockComments[1]} />

        {/* 현재 단계 카드 (댓글 입력 바로 위) */}
        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <span className="text-sm font-semibold">기술 검토</span>
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-600 text-[10px]">
              진행중
            </Badge>
            <span className="ml-auto text-xs text-muted-foreground">1/2 완료</span>
          </div>
          <div className="px-4 py-2">
            {activeStage.assignees.map((a) => (
              <AssigneeStatus key={a.id} assignee={a} />
            ))}
          </div>
        </div>

        <CommentInput actionLabel="검토 승인" />
      </div>
    </PageShell>
  );
}

// ===== 방향 D: 하이브리드 — 상단 요약 + 하단 게이트 카드 =====

function LayoutD() {
  const [gateExpanded, setGateExpanded] = useState(true);

  return (
    <PageShell title="방향 D — 하이브리드 (상단 요약 + GitHub merge box)">
      <Header />
      {/* 상단 한 줄 요약 */}
      <div className="mt-4 border-y bg-muted/20 px-6 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">기술 검토 중</span>
            <span className="text-xs text-muted-foreground">— 박지후 검토 대기</span>
          </div>
          <MiniProgress stages={workflow.stages} />
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        <TimelineEvent text={mockEvents[0].text} time={mockEvents[0].time} />
        <CommentItem {...mockComments[0]} />
        <TimelineEvent text={mockEvents[1].text} time={mockEvents[1].time} />
        <CommentItem {...mockComments[1]} />

        {/* GitHub merge box 스타일 게이트 카드 */}
        <div className="rounded-lg border-2 border-amber-300/50 overflow-hidden">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between bg-amber-50/50 px-4 py-3 text-left"
            onClick={() => setGateExpanded((p) => !p)}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-100">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold">기술 검토 — 1/2 승인 완료</p>
                <p className="text-xs text-muted-foreground">1명의 검토가 남아있습니다.</p>
              </div>
            </div>
            {gateExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {gateExpanded ? (
            <div className="border-t border-amber-200/50">
              <div className="px-4 py-2">
                {activeStage.assignees.map((a) => (
                  <AssigneeStatus key={a.id} assignee={a} />
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-4 py-3">
                <Button size="sm" variant="outline">
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  반려
                </Button>
                <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  검토 승인
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {/* 댓글 입력 (액션 버튼은 게이트 카드 안에 있으므로 여기선 댓글만) */}
        <div className="flex gap-3">
          <UserAvatar name="나" className="h-8 w-8 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="rounded-lg border bg-card px-4 py-3">
              <p className="text-sm text-muted-foreground">댓글을 작성하세요...</p>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button size="sm" variant="outline">
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                변경관리 닫기
              </Button>
              <Button size="sm">댓글</Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ===== 스토리 설정 =====

function AllLayouts() {
  return (
    <div className="space-y-8 bg-muted/30 py-8">
      <LayoutA />
      <LayoutB />
      <LayoutC />
      <LayoutD />
    </div>
  );
}

const meta = {
  title: "Components/EngineeringChangeDetailScreen/WorkflowLayoutIdeas",
  component: AllLayouts,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AllLayouts>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => <AllLayouts />,
};

export const A_TimelineInline: Story = {
  render: () => (
    <div className="bg-muted/30 py-8">
      <LayoutA />
    </div>
  ),
};

export const B_FixedProgressBar: Story = {
  render: () => (
    <div className="bg-muted/30 py-8">
      <LayoutB />
    </div>
  ),
};

export const C_SectionAboveComment: Story = {
  render: () => (
    <div className="bg-muted/30 py-8">
      <LayoutC />
    </div>
  ),
};

export const D_HybridMergeBox: Story = {
  render: () => (
    <div className="bg-muted/30 py-8">
      <LayoutD />
    </div>
  ),
};
