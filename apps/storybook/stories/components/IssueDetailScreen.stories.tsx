import type { Meta, StoryObj } from "@storybook/react-vite";
import { IssueDetailScreen } from "@fabbit/components";

const meta = {
  title: "Components/IssueDetailScreen",
  component: IssueDetailScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    issue: {
      title: "센서 모듈 하우징 간섭 이슈",
      number: 42,
      state: "OPEN",
      createdAt: "2026-03-06T10:20:00.000Z",
      isModified: true,
      body: "<p>센서 모듈 하우징과 브라켓 사이 간섭이 확인되었습니다. 간극 재검토가 필요합니다.</p>",
      createdBy: {
        id: "user-1",
        name: "문성하",
        email: "seongha@fabbit.ai",
        profileImageUrl: null,
      },
      assignees: [
        {
          id: "user-1",
          name: "문성하",
          email: "seongha@fabbit.ai",
          profileImageUrl: null,
        },
      ],
      labels: [
        {
          id: "label-1",
          name: "간섭",
          colorHex: "#FF7A59",
        },
      ],
      linkedChanges: [
        {
          id: "cr-1",
          number: 15,
          title: "브라켓 여유간격 반영",
          state: "SUBMITTED",
        },
      ],
      linkedIssues: [],
      relatedParts: [
        {
          id: "part-1",
          partNumber: "SM-2048",
          name: "센서 모듈 하우징",
        },
      ],
      attachments: [
        {
          id: "file-1",
          name: "interference-report.pdf",
          size: "412KB",
          type: "pdf",
          uploadedBy: "문성하",
          uploadedAt: "2026-03-06T10:25:00.000Z",
          url: "https://example.com/report.pdf",
        },
      ],
    },
    timelineItems: [
      {
        kind: "event",
        id: "event-1",
        event: {
          id: "event-1",
          type: "issue_created",
          author: {
            name: "문성하",
            profileImageUrl: null,
          },
          createdAtLabel: "2시간 전",
        },
      },
      {
        kind: "comment",
        id: "comment-1",
        author: {
          id: "user-1",
          name: "문성하",
          profileImageUrl: null,
        },
        authorId: "user-1",
        body: "<p>브라켓 홀 위치를 1.5mm 이동하는 안으로 검토 중입니다.</p>",
        createdAt: "2026-03-06T11:10:00.000Z",
        isModified: false,
        updatedAt: "2026-03-06T11:10:00.000Z",
      },
    ],
    commentCount: 1,
    currentUser: {
      id: "user-1",
      name: "문성하",
      profileImageUrl: null,
    },
    availableMembers: [
      { id: "user-1", name: "문성하", email: "seongha@fabbit.ai" },
      { id: "user-2", name: "김서윤", email: "seoyun@fabbit.ai" },
    ],
    availableLabels: [
      { id: "label-1", name: "간섭", colorHex: "#FF7A59" },
      { id: "label-2", name: "양산 영향", colorHex: "#2563eb" },
    ],
    availableChanges: [
      { id: "cr-1", number: 15, title: "브라켓 여유간격 반영", state: "SUBMITTED" },
      { id: "cr-2", number: 18, title: "하우징 보강 리브 추가", state: "DRAFT" },
    ],
    searchedParts: [
      { id: "part-1", partNumber: "SM-2048", name: "센서 모듈 하우징" },
      { id: "part-2", partNumber: "BRK-0081", name: "센서 브라켓" },
    ],
    selectedAssigneeIds: ["user-1"],
    selectedLabelIds: ["label-1"],
    selectedPartIds: ["part-1"],
    linkedChangeIds: ["cr-1"],
    onRequestMembers: () => undefined,
    onRequestLabels: () => undefined,
    onRequestParts: () => undefined,
    onRequestChanges: () => undefined,
    onSyncAssignees: async () => undefined,
    onSyncLabels: async () => undefined,
    onSyncParts: async () => undefined,
    onSyncLinkedChanges: async () => undefined,
    onPartsSearchChange: () => undefined,
    onChangeSearchChange: () => undefined,
    onBack: () => undefined,
    onRetry: () => undefined,
    onSaveIssue: async () => undefined,
    onCreateComment: async () => undefined,
    onUpdateComment: async () => undefined,
    onDeleteComment: async () => undefined,
    onCloseIssue: () => undefined,
    onReopenIssue: () => undefined,
    onNavigateToIssueMention: () => undefined,
    onNavigateToChange: () => undefined,
    onCreateLinkedChange: () => undefined,
    onAttachFiles: async () => undefined,
    onDeleteFile: async () => undefined,
  },
} satisfies Meta<typeof IssueDetailScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
