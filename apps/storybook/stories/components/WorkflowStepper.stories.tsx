import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserAvatar, WorkflowStepper, type WorkflowStep } from "@fabbit/ui";

const meta = {
  title: "UI/WorkflowStepper",
  component: WorkflowStepper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof WorkflowStepper>;

export default meta;

type Story = StoryObj<typeof meta>;

const reviewingSteps: WorkflowStep[] = [
  {
    id: "review",
    label: "검토",
    status: "active",
    children: (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <UserAvatar name="김설계" className="h-5 w-5 text-[8px]" />
          <span className="text-xs text-foreground">김설계</span>
          <span className="text-xs text-emerald-600">완료</span>
        </div>
        <div className="flex items-center gap-2">
          <UserAvatar name="박기술" className="h-5 w-5 text-[8px]" />
          <span className="text-xs text-foreground">박기술</span>
          <span className="text-xs text-emerald-600">완료</span>
        </div>
        <div className="flex items-center gap-2">
          <UserAvatar name="최품질" className="h-5 w-5 text-[8px]" />
          <span className="text-xs text-foreground">최품질</span>
          <span className="text-xs text-muted-foreground">대기</span>
        </div>
      </div>
    ),
  },
  {
    id: "approve",
    label: "승인",
    status: "pending",
    children: (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <UserAvatar name="이부장" className="h-5 w-5 text-[8px]" />
          <span className="text-xs text-muted-foreground">이부장</span>
        </div>
      </div>
    ),
  },
  {
    id: "release",
    label: "배포",
    status: "pending",
  },
];

const approvalSteps: WorkflowStep[] = [
  {
    id: "review",
    label: "검토",
    status: "completed",
    children: (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <UserAvatar name="김설계" className="h-5 w-5 text-[8px]" />
          <span className="text-xs text-foreground">김설계</span>
          <span className="text-xs text-emerald-600">완료</span>
        </div>
        <div className="flex items-center gap-2">
          <UserAvatar name="박기술" className="h-5 w-5 text-[8px]" />
          <span className="text-xs text-foreground">박기술</span>
          <span className="text-xs text-emerald-600">완료</span>
        </div>
      </div>
    ),
  },
  {
    id: "approve",
    label: "승인",
    status: "active",
    children: (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <UserAvatar name="이부장" className="h-5 w-5 text-[8px]" />
          <span className="text-xs text-foreground">이부장</span>
          <span className="text-xs text-muted-foreground">대기</span>
        </div>
        <div className="flex items-center gap-2">
          <UserAvatar name="정이사" className="h-5 w-5 text-[8px]" />
          <span className="text-xs text-foreground">정이사</span>
          <span className="text-xs text-muted-foreground">대기</span>
        </div>
      </div>
    ),
  },
  {
    id: "release",
    label: "배포",
    status: "pending",
  },
];

const releasedSteps: WorkflowStep[] = [
  {
    id: "review",
    label: "검토",
    status: "completed",
  },
  {
    id: "approve",
    label: "승인",
    status: "completed",
  },
  {
    id: "release",
    label: "배포",
    status: "completed",
  },
];

export const Reviewing: Story = {
  args: { steps: reviewingSteps },
};

export const Approval: Story = {
  args: { steps: approvalSteps },
};

export const Released: Story = {
  args: { steps: releasedSteps },
};

export const Showcase: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8">
      <div>
        <p className="mb-4 text-sm font-medium text-muted-foreground">검토 중</p>
        <WorkflowStepper steps={reviewingSteps} />
      </div>
      <div>
        <p className="mb-4 text-sm font-medium text-muted-foreground">승인 대기</p>
        <WorkflowStepper steps={approvalSteps} />
      </div>
      <div>
        <p className="mb-4 text-sm font-medium text-muted-foreground">배포 완료</p>
        <WorkflowStepper steps={releasedSteps} />
      </div>
    </div>
  ),
};
