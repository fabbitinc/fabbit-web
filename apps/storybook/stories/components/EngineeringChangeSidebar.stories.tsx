import type { Meta, StoryObj } from "@storybook/react-vite";
import { EngineeringChangeSidebar, type EngineeringChangeSidebarProps } from "@fabbit/components";

const sampleEngineeringChange = {
  engineeringChangeState: "SUBMITTED",
  commentsCount: 18,
  createdAt: "2026-03-05T10:40:00Z",
  updatedAt: "2026-03-07T03:15:00Z",
  mergedAt: null,
  mergedBy: null,
  assignees: [
    {
      userId: "user-1",
      fullName: "문서연",
      email: "seoyeon.moon@fabbit.dev",
      phone: null,
      profileImageUrl: null,
    },
  ],
  reviewers: [
    {
      userId: "user-2",
      fullName: "박시우",
      email: "siwoo.park@fabbit.dev",
      phone: null,
      profileImageUrl: null,
      reviewStatus: "APPROVED",
      reviewedAt: "2026-03-07T01:20:00Z",
    },
    {
      userId: "user-3",
      fullName: "김하준",
      email: "hajun.kim@fabbit.dev",
      phone: null,
      profileImageUrl: null,
      reviewStatus: "PENDING",
      reviewedAt: null,
    },
  ],
  workflow: {
    stages: [
      {
        id: "review",
        label: "기술 검토",
        type: "REVIEW",
        status: "active",
        description: "도면, BOM, 제조 영향 검토",
        assignees: [
          {
            id: "user-2",
            name: "박시우",
            type: "USER",
            status: "APPROVED",
            actedAt: "2026-03-07T01:20:00Z",
            actedByName: "박시우",
          },
          {
            id: "user-3",
            name: "김하준",
            type: "USER",
            status: "PENDING",
            subtitle: "기구 설계 리드",
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
            subtitle: "팀 승인 필요",
          },
        ],
      },
      {
        id: "release",
        label: "시스템 반영",
        type: "RELEASE",
        status: "pending",
        description: "PLM/BOM 반영",
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
  },
  labels: [
    { id: "label-1", name: "승인 필요", color: "#f97316" },
    { id: "label-2", name: "제조 영향", color: "#2563eb" },
  ],
  parts: [
    { id: "part-1", partNumber: "DRV-PLATE-0142", name: "드라이브 유닛 베이스 플레이트" },
  ],
  files: [
    {
      fileId: "file-1",
      originalName: "change-summary.pdf",
      contentType: "application/pdf",
      fileSize: 204800,
      fileUrl: "https://example.com/change-summary.pdf",
      createdAt: "2026-03-06T13:25:00Z",
    },
  ],
  linkedIssues: [
    {
      id: "issue-1",
      number: 187,
      title: "인버터 하우징 간섭",
      state: "OPEN",
    },
  ],
} satisfies EngineeringChangeSidebarProps["engineeringChange"];

const meta = {
  title: "Components/EngineeringChangeSidebar",
  component: EngineeringChangeSidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    engineeringChange: sampleEngineeringChange,
    isAttachingFiles: false,
    onAttachFiles: async () => undefined,
    onDeleteFile: async () => undefined,
    onEditIssues: () => undefined,
    onEditLabels: () => undefined,
    onEditParts: () => undefined,
    onNavigateToIssue: () => undefined,
  },
} satisfies Meta<typeof EngineeringChangeSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyState: Story = {
  args: {
    engineeringChange: {
      ...sampleEngineeringChange,
      assignees: [],
      files: [],
      labels: [],
      linkedIssues: [],
      parts: [],
      reviewers: [],
      workflow: {
        stages: [],
      },
    },
  },
};

export const WithoutWorkflow: Story = {
  args: {
    engineeringChange: {
      ...sampleEngineeringChange,
      workflow: undefined,
    },
  },
};

export const StepWorkflow: Story = {
  args: {
    engineeringChange: sampleEngineeringChange,
  },
};

export const Showcase: Story = {
  render: (args) => (
    <div className="grid gap-6 xl:grid-cols-2">
      <EngineeringChangeSidebar
        {...args}
        engineeringChange={{
          ...sampleEngineeringChange,
          workflow: undefined,
        }}
      />
      <EngineeringChangeSidebar
        {...args}
        engineeringChange={{
          ...sampleEngineeringChange,
        }}
      />
    </div>
  ),
};
