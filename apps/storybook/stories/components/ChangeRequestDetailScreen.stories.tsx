import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ChangeRequestDetailScreen } from "@fabbit/components";

function ChangeRequestDetailScreenStory() {
  const [activeTab, setActiveTab] = useState("conversation");

  return (
    <ChangeRequestDetailScreen
      changeRequest={{
        title: "PCB 커넥터 핀 배열 변경",
        number: 15,
        crState: "SUBMITTED",
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
        assignees: [
          {
            userId: "user-1",
            fullName: "문성하",
            email: "seongha@fabbit.ai",
            phone: null,
            profileImageUrl: null,
          },
        ],
        reviewers: [
          {
            userId: "user-2",
            fullName: "김서윤",
            email: "seoyun@fabbit.ai",
            phone: null,
            profileImageUrl: null,
            reviewStatus: "PENDING",
            reviewedAt: null,
          },
        ],
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
      }}
      activeTab={activeTab}
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
      onSaveChangeRequest={async () => undefined}
      onCreateComment={async () => undefined}
      onUpdateComment={async () => undefined}
      onDeleteComment={async () => undefined}
      onSubmitChangeRequest={() => undefined}
      onMergeChangeRequest={() => undefined}
      onCloseChangeRequest={() => undefined}
      onReopenChangeRequest={() => undefined}
      onNavigateToIssueMention={() => undefined}
      onEditAssignees={() => undefined}
      onEditReviewers={() => undefined}
      onEditLabels={() => undefined}
      onEditParts={() => undefined}
      onEditIssues={() => undefined}
      onNavigateToIssue={() => undefined}
      onAttachFiles={async () => undefined}
      onDeleteFile={async () => undefined}
    />
  );
}

const meta = {
  title: "Components/ChangeRequestDetailScreen",
  component: ChangeRequestDetailScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ChangeRequestDetailScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ChangeRequestDetailScreenStory />,
};
