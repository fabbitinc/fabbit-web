import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Pencil,
  XCircle,
} from "lucide-react";
import { Badge, Button, TiptapEditor, UserAvatar } from "@fabbit/ui";
import {
  CommentInput,
  IssueSidebar,
  TimelineComment,
  TimelineEventItem,
  type TimelineEventData,
} from "@fabbit/components";

/* ================================================================
   타입
   ================================================================ */

type ChangeRequestStatus = "draft" | "open" | "closed" | "merged";

interface ChangeLabel {
  id?: string;
  name: string;
  colorHex: string;
}

interface ChangeAssignee {
  id?: string;
  name: string;
  profileImageUrl?: string | null;
}

interface TimelineAuthor {
  name: string;
  profileImageUrl?: string | null;
}

interface CRRelatedPart {
  id: string;
  partNumber: string;
  name: string;
  category?: string;
}

interface LinkedChangeBadge {
  id: string;
  number: number;
  title: string;
  state: string;
}

interface ChangeRequest {
  id: string;
  number: number;
  type: "issue" | "pr";
  title: string;
  status: ChangeRequestStatus;
  author: string;
  createdAt: string;
  labels: ChangeLabel[];
  assignees: ChangeAssignee[];
  reviewers: ChangeAssignee[];
  description: string;
  isModified?: boolean;
  timeline: TimelineEventData[];
  attachments: { id: string; name: string; size: string; type: "pdf" | "step" | "dwg" | "xlsx" | "image" | "other"; uploadedBy: string; uploadedAt: string }[];
  relatedParts: CRRelatedPart[];
  commentsCount: number;
  linkedChanges: LinkedChangeBadge[];
  linkedIssues: { id: string; number: number; title: string; state: string }[];
}

/* ================================================================
   Mock 데이터
   ================================================================ */

const testAuthor: TimelineAuthor = { name: "Test User", profileImageUrl: null };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const mockCR: ChangeRequest = {
  id: "issue-1",
  number: 1,
  type: "issue",
  title: "sadf",
  status: "open",
  author: "Test User",
  createdAt: "2026-03-07T00:12:00Z",
  isModified: false,
  labels: [
    { name: "설계변경", colorHex: "#10b981" },
    { name: "개선", colorHex: "#6b7280" },
    { name: "공급사", colorHex: "#3b82f6" },
    { name: "시험검증", colorHex: "#6b7280" },
  ],
  assignees: [{ name: "Test User", profileImageUrl: null }],
  reviewers: [],
  description: "sdf",
  timeline: [
    {
      id: "ev-assigned",
      type: "assigned",
      author: testAuthor,
      createdAtLabel: timeAgo("2026-03-07T00:12:30Z"),
      addedNames: ["Test User"],
    },
    {
      id: "ev-comment",
      type: "comment",
      author: testAuthor,
      createdAtLabel: timeAgo("2026-03-07T00:13:00Z"),
      content: "ㅁㄴㅇㄹㅇㅁ",
    },
    {
      id: "ev-labels",
      type: "labels_changed",
      author: testAuthor,
      createdAtLabel: timeAgo("2026-03-07T00:13:10Z"),
      addedLabels: [
        { name: "개선", color: "#6b7280" },
        { name: "설계변경", color: "#10b981" },
        { name: "시험검증", color: "#6b7280" },
        { name: "공급사", color: "#3b82f6" },
      ],
    },
    {
      id: "ev-parts1",
      type: "part_added",
      author: testAuthor,
      createdAtLabel: timeAgo("2026-03-07T00:14:00Z"),
      addedPartCount: 3,
      addedPartNumbers: ["공용볼트M10", "공용와셔M10", "공용너트M10"],
    },
    {
      id: "ev-parts2",
      type: "part_added",
      author: testAuthor,
      createdAtLabel: timeAgo("2026-03-07T00:14:10Z"),
      addedPartCount: 3,
      addedPartNumbers: ["DEEP-L4", "DEEP-L4-B", "DEEP-L0"],
    },
    {
      id: "ev-unlink",
      type: "cr_changed",
      author: testAuthor,
      createdAtLabel: timeAgo("2026-03-07T00:14:30Z"),
      linkedIssueCount: -1,
      linkedIssues: [{ number: 3, title: "ㅂㄷㅈ", type: "change_request" }],
    },
    {
      id: "ev-link",
      type: "cr_changed",
      author: testAuthor,
      createdAtLabel: timeAgo("2026-03-07T00:14:40Z"),
      linkedIssueCount: 1,
      linkedIssues: [{ number: 3, title: "ㅂㄷㅈ", type: "change_request" }],
    },
  ],
  attachments: [],
  relatedParts: [
    { id: "p1", partNumber: "공용볼트M10", name: "공용 볼트 M10" },
    { id: "p2", partNumber: "공용와셔M10", name: "공용 와셔 M10" },
    { id: "p3", partNumber: "공용너트M10", name: "공용 너트 M10" },
    { id: "p4", partNumber: "DEEP-L0", name: "깊은-레벨0" },
    { id: "p5", partNumber: "DEEP-L4", name: "깊은-레벨4" },
    { id: "p6", partNumber: "DEEP-L4-B", name: "깊은-레벨4-분기" },
  ],
  commentsCount: 1,
  linkedChanges: [{ id: "cr1", number: 3, title: "ㅂㄷㅈ", state: "draft" }],
  linkedIssues: [],
};

/* ================================================================
   헬퍼
   ================================================================ */

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

const STATUS_BADGE_STYLE: Record<string, string> = {
  draft: "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400",
  open: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  merged: "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-400",
  closed: "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "초안",
  open: "열림",
  merged: "반영됨",
  closed: "닫힘",
};

function CRStatusIcon({ status }: { status: ChangeRequestStatus }) {
  const cls = "h-4 w-4";
  return status === "open" ? (
    <AlertCircle className={`${cls} text-emerald-600 dark:text-emerald-400`} />
  ) : (
    <CheckCircle2 className={`${cls} text-purple-600 dark:text-purple-400`} />
  );
}

/* ================================================================
   메인: ChangeRequestDetail 재현
   ================================================================ */

function IssueDetailScreen() {
  const cr = mockCR;
  const commentCount = cr.timeline.filter((e) => e.type === "comment").length;

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-6">
      {/* 뒤로가기 */}
      <button
        type="button"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        이슈 목록
      </button>

      {/* 타이틀 */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          {cr.title}
          <span className="ml-2 font-normal text-muted-foreground">#{cr.number}</span>
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={STATUS_BADGE_STYLE[cr.status]}>
            <CRStatusIcon status={cr.status} />
            {STATUS_LABEL[cr.status]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{cr.author}</span>
            {" 님이 "}
            {formatFullDate(cr.createdAt)}
            {" 에 열었습니다"}
          </span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            댓글 {commentCount}개
          </span>
        </div>
      </div>

      {/* 2컬럼 레이아웃 */}
      <div className="mt-6 flex gap-6">
        {/* 왼쪽: 타임라인 */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* 본문 */}
          <TimelineComment
            author={{ name: cr.author }}
            createdAtLabel={timeAgo(cr.createdAt)}
            isModified={cr.isModified}
            showAuthorBadge
            onEdit={() => {}}
          >
            {typeof cr.description === "string" ? cr.description : null}
          </TimelineComment>

          {/* 타임라인 이벤트 */}
          {cr.timeline.map((event) =>
            event.type === "comment" ? (
              <TimelineComment
                key={event.id}
                author={event.author}
                createdAtLabel={event.createdAtLabel}
                showAuthorBadge
                onEdit={() => {}}
              >
                {typeof event.content === "string" ? event.content : null}
              </TimelineComment>
            ) : (
              <TimelineEventItem key={event.id} event={event} />
            ),
          )}

          {/* 구분선 */}
          <div className="border-t" />

          {/* 댓글 입력 */}
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

        {/* 오른쪽: 사이드바 */}
        <div className="hidden w-70 shrink-0 lg:block">
          <IssueSidebar
            assignees={cr.assignees.map((a) => ({ name: a.name, profileImageUrl: a.profileImageUrl }))}
            labels={cr.labels}
            linkedChanges={cr.linkedChanges}
            linkedIssues={cr.linkedIssues}
            relatedParts={cr.relatedParts}
            attachments={cr.attachments.map((a) => ({
              id: a.id,
              name: a.name,
              size: a.size,
              type: a.type,
              uploadedBy: a.uploadedBy,
              uploadedAt: a.uploadedAt,
            }))}
            onCreateLinkedChange={() => {}}
            onEditAssignees={() => alert("담당자 편집")}
            onEditLabels={() => alert("라벨 편집")}
            onEditParts={() => alert("부품 편집")}
            onEditLinkedChanges={() => alert("변경 요청 편집")}
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
  render: () => <IssueDetailScreen />,
};
