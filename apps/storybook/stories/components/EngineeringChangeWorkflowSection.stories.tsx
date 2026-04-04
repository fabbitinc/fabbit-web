import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  EngineeringChangeWorkflowSection,
  type EngineeringChangeWorkflowData,
} from "@fabbit/components";

const workflow: EngineeringChangeWorkflowData = {
  stages: [
    {
      id: "review",
      label: "기술 검토",
      type: "REVIEW",
      status: "active",
      description: "도면, BOM, 제조 영향 검토",
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
          name: "김하준",
          type: "USER",
          status: "PENDING",
          subtitle: "기구 설계",
        },
      ],
    },
    {
      id: "approval",
      label: "변경 승인",
      type: "APPROVAL",
      status: "pending",
      description: "CCB 승인",
      assignees: [
        {
          id: "team-1",
          name: "품질팀",
          type: "TEAM",
          status: "PENDING",
          subtitle: "팀 합의 필요",
        },
      ],
    },
    {
      id: "release",
      label: "시스템 반영",
      type: "RELEASE",
      status: "pending",
      description: "PLM/BOM 릴리즈",
      assignees: [
        {
          id: "user-3",
          name: "이도윤",
          type: "USER",
          status: "PENDING",
          subtitle: "PLM 관리자",
        },
      ],
    },
  ],
};

const meta = {
  title: "Components/EngineeringChangeWorkflowSection",
  component: EngineeringChangeWorkflowSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    workflow,
  },
} satisfies Meta<typeof EngineeringChangeWorkflowSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Released: Story = {
  args: {
    workflow: {
      stages: workflow.stages.map((stage) => ({
        ...stage,
        status: "completed",
        assignees: stage.assignees.map((assignee) => ({
          ...assignee,
          status: "APPROVED",
          actedAt: assignee.actedAt ?? "2026-03-07T05:00:00Z",
          actedByName: assignee.actedByName ?? assignee.name,
        })),
      })),
    },
  },
};

export const Showcase: Story = {
  render: (args) => (
    <div className="grid gap-6 xl:grid-cols-2">
      <EngineeringChangeWorkflowSection {...args} />
      <EngineeringChangeWorkflowSection
        workflow={{
          stages: workflow.stages.map((stage, index) => ({
            ...stage,
            status: index === 0 ? "completed" : index === 1 ? "active" : "pending",
            assignees: stage.assignees.map((assignee) => ({
              ...assignee,
              status: index === 0 ? "APPROVED" : "PENDING",
              actedAt: index === 0 ? assignee.actedAt ?? "2026-03-07T03:20:00Z" : null,
              actedByName: index === 0 ? assignee.actedByName ?? assignee.name : undefined,
            })),
          })),
        }}
      />
    </div>
  ),
};
