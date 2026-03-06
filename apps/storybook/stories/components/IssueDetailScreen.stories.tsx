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
    onBack: () => undefined,
    onRetry: () => undefined,
    onSaveIssue: async () => undefined,
    onCreateComment: async () => undefined,
    onUpdateComment: async () => undefined,
    onDeleteComment: async () => undefined,
    onCloseIssue: () => undefined,
    onReopenIssue: () => undefined,
    onNavigateToIssueMention: () => undefined,
    onEditAssignees: () => undefined,
    onEditLabels: () => undefined,
    onEditParts: () => undefined,
    onEditLinkedChanges: () => undefined,
    onNavigateToChange: () => undefined,
    onCreateLinkedChange: () => undefined,
    onAttachFiles: async () => undefined,
    onDeleteFile: async () => undefined,
  },
} satisfies Meta<typeof IssueDetailScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
