import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowLeft, MessageSquare, XCircle } from "lucide-react";
import { Button, TiptapEditor } from "@fabbit/ui";
import {
  CommentInput,
  IssueSidebar,
  IssueStatusBadge,
  TimelineComment,
  TimelineEventItem,
  type IssueDetailScreenProps,
} from "@fabbit/components";
import { manufacturingIssueDetailArgs } from "../shared/issue-detail-story-data";

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "방금";
  }

  if (minutes < 60) {
    return `${minutes}분 전`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}시간 전`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days}일 전`;
  }

  const date = new Date(iso);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function isCommentItem(
  item: IssueDetailScreenProps["timelineItems"][number],
): item is Extract<IssueDetailScreenProps["timelineItems"][number], { kind: "comment" }> {
  return item.kind === "comment";
}

function IssueDetailPageStory() {
  const issue = manufacturingIssueDetailArgs.issue;

  if (!issue) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-6">
      <button
        type="button"
        className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        이슈 목록
      </button>

      <div>
        <h2 className="text-xl font-bold text-foreground">
          {issue.title}
          <span className="ml-2 font-normal text-muted-foreground">#{issue.number}</span>
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <IssueStatusBadge state={issue.state} />
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{issue.createdBy?.name ?? "알 수 없음"}</span>
            {" 님이 "}
            {formatFullDate(issue.createdAt)}
            {" 에 열었습니다"}
          </span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            댓글 {manufacturingIssueDetailArgs.commentCount}개
          </span>
        </div>
      </div>

      <div className="mt-6 flex gap-6">
        <div className="min-w-0 flex-1 space-y-4">
          <TimelineComment
            author={{ name: issue.createdBy?.name ?? "알 수 없음", profileImageUrl: issue.createdBy?.profileImageUrl }}
            createdAtLabel={timeAgo(issue.createdAt)}
            isModified={issue.isModified}
            showAuthorBadge
          >
            <TiptapEditor
              content={issue.body ?? undefined}
              editable={false}
              hideToolbar
              minHeight={0}
              className="border-0 bg-transparent"
            />
          </TimelineComment>

          {manufacturingIssueDetailArgs.timelineItems.map((item) =>
            isCommentItem(item) ? (
              <TimelineComment
                key={item.id}
                author={{
                  name: item.author?.name ?? "알 수 없음",
                  profileImageUrl: item.author?.profileImageUrl,
                }}
                createdAtLabel={timeAgo(item.createdAt)}
                isModified={item.isModified}
              >
                <TiptapEditor
                  content={item.body ?? undefined}
                  editable={false}
                  hideToolbar
                  minHeight={0}
                  className="border-0 bg-transparent"
                />
              </TimelineComment>
            ) : (
              <TimelineEventItem key={item.id} event={item.event} />
            ),
          )}

          <div className="border-t" />

          <CommentInput
            editor={<TiptapEditor placeholder="댓글을 작성하세요..." minHeight={100} />}
            actions={
              <>
                <Button size="sm" variant="outline">
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  이슈 닫기
                </Button>
                <Button size="sm">댓글</Button>
              </>
            }
          />
        </div>

        <div className="hidden w-70 shrink-0 lg:block">
          <IssueSidebar
            assignees={issue.assignees}
            labels={issue.labels}
            linkedChanges={issue.linkedChanges}
            linkedIssues={issue.linkedIssues}
            relatedParts={issue.relatedParts}
            attachments={issue.attachments}
            onCreateLinkedChange={() => undefined}
            onEditAssignees={() => undefined}
            onEditLabels={() => undefined}
            onEditParts={() => undefined}
            onEditLinkedChanges={() => undefined}
          />
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   스토리
   ================================================================ */

const meta = {
  title: "Pages/IssueDetail",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <IssueDetailPageStory />,
};
