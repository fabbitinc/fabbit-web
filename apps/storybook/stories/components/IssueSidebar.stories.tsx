import type { Meta, StoryObj } from "@storybook/react-vite";
import { IssueSidebar, type IssueSidebarProps } from "@fabbit/components";

const sampleProps: IssueSidebarProps = {
  assignees: [
    { id: "user-1", name: "문서연", profileImageUrl: null },
    { id: "user-2", name: "김하준", profileImageUrl: null },
  ],
  labels: [
    { id: "label-1", name: "긴급", colorHex: "#ef4444" },
    { id: "label-2", name: "양산 영향", colorHex: "#2563eb" },
  ],
  linkedChanges: [
    { id: "change-1", number: 42, title: "인버터 하우징 간섭 수정", state: "open" },
  ],
  linkedIssues: [],
  relatedParts: [
    { id: "part-1", partNumber: "DRV-PLATE-0142", name: "드라이브 유닛 베이스 플레이트" },
    { id: "part-2", partNumber: "CTRL-PCB-0207", name: "모터 제어 PCB" },
  ],
  attachments: [
    {
      id: "file-1",
      name: "issue-evidence.png",
      size: "1 MB",
      type: "image",
      uploadedBy: "문서연",
      uploadedAt: "2026-03-06T09:10:00Z",
      url: "https://example.com/issue-evidence.png",
    },
  ],
  onCreateLinkedChange: () => undefined,
  onEditAssignees: () => alert("담당자 편집"),
  onEditLabels: () => alert("라벨 편집"),
  onEditParts: () => alert("부품 편집"),
  onEditLinkedChanges: () => alert("변경 요청 편집"),
};

const meta = {
  title: "Components/IssueSidebar",
  component: IssueSidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: sampleProps,
} satisfies Meta<typeof IssueSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyState: Story = {
  args: {
    assignees: [],
    labels: [],
    linkedChanges: [],
    linkedIssues: [],
    relatedParts: [],
    attachments: [],
  },
};

export const Showcase: Story = {
  render: (args) => (
    <div className="grid gap-6 xl:grid-cols-2">
      <IssueSidebar {...args} />
      <IssueSidebar
        {...args}
        assignees={[]}
        labels={[]}
        linkedChanges={[]}
        relatedParts={[]}
        attachments={[]}
      />
    </div>
  ),
};
