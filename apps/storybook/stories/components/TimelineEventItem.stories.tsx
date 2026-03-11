import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimelineEventItem, type TimelineEventData } from "@fabbit/components";

const author = { name: "문서연", profileImageUrl: null };

const meta = {
  title: "Components/TimelineEventItem",
  component: TimelineEventItem,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof TimelineEventItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Assigned: Story = {
  args: {
    event: {
      id: "1",
      type: "assigned",
      author,
      createdAtLabel: "2시간 전",
      addedNames: ["김하준", "이수진"],
    },
  },
};

export const LabelsChanged: Story = {
  args: {
    event: {
      id: "2",
      type: "labels_changed",
      author,
      createdAtLabel: "1시간 전",
      addedLabels: [
        { name: "긴급", color: "#ef4444" },
        { name: "설계변경", color: "#10b981" },
      ],
      removedLabels: [
        { name: "검토중", color: "#6b7280" },
      ],
    },
  },
};

export const PartAdded: Story = {
  args: {
    event: {
      id: "3",
      type: "part_added",
      author,
      createdAtLabel: "30분 전",
      addedPartCount: 3,
      addedPartNumbers: ["DRV-PLATE-0142", "CTRL-PCB-0207", "HSG-INV-0089"],
    },
  },
};

export const CrChanged: Story = {
  args: {
    event: {
      id: "4",
      type: "cr_changed",
      author,
      createdAtLabel: "15분 전",
      linkedIssueCount: 1,
      linkedIssues: [{ number: 42, title: "인버터 하우징 간섭 수정", type: "change_request" }],
    },
  },
};

export const IssueCreated: Story = {
  args: {
    event: {
      id: "5",
      type: "issue_created",
      author,
      createdAtLabel: "3일 전",
    },
  },
};

export const StatusChange: Story = {
  args: {
    event: {
      id: "6",
      type: "status_change",
      author,
      createdAtLabel: "방금",
      content: "closed",
    },
  },
};

export const ReviewApproved: Story = {
  args: {
    event: {
      id: "7",
      type: "review_approved",
      author: { name: "박도현", profileImageUrl: null },
      createdAtLabel: "10분 전",
      content: "검토 완료, 진행해도 됩니다",
    },
  },
};

export const ChangeRequestSubmitted: Story = {
  args: {
    event: {
      id: "9",
      type: "cr_state_changed",
      author,
      createdAtLabel: "방금",
      content: {
        from: "DRAFT",
        to: "SUBMITTED",
      },
    },
  },
};

export const FileAttached: Story = {
  args: {
    event: {
      id: "8",
      type: "file_attached",
      author,
      createdAtLabel: "5분 전",
      fileCount: 2,
      fileNames: ["simulation-result.pdf", "interference-check.xlsx"],
    },
  },
};

export const Showcase: Story = {
  render: () => {
    const events: TimelineEventData[] = [
      { id: "1", type: "issue_created", author, createdAtLabel: "3일 전" },
      { id: "2", type: "assigned", author, createdAtLabel: "3일 전", addedNames: ["김하준"] },
      { id: "3", type: "labels_changed", author, createdAtLabel: "2일 전", addedLabels: [{ name: "긴급", color: "#ef4444" }, { name: "설계변경", color: "#10b981" }] },
      { id: "4", type: "part_added", author, createdAtLabel: "1일 전", addedPartCount: 2, addedPartNumbers: ["DRV-PLATE-0142", "CTRL-PCB-0207"] },
      { id: "5", type: "file_attached", author, createdAtLabel: "5시간 전", fileNames: ["analysis.pdf"] },
      { id: "6", type: "cr_changed", author, createdAtLabel: "2시간 전", linkedIssueCount: 1, linkedIssues: [{ number: 42, title: "인버터 하우징 간섭 수정", type: "change_request" }] },
      { id: "7", type: "review_approved", author: { name: "박도현", profileImageUrl: null }, createdAtLabel: "1시간 전" },
      { id: "8", type: "cr_state_changed", author, createdAtLabel: "40분 전", content: { from: "DRAFT", to: "SUBMITTED" } },
      { id: "9", type: "status_change", author, createdAtLabel: "방금", content: "closed" },
    ];
    return (
      <div className="space-y-1">
        {events.map((e) => (
          <TimelineEventItem key={e.id} event={e} />
        ))}
      </div>
    );
  },
};
