import type { IssueDetailScreenProps, TimelineEventData } from "@fabbit/components";

function toRelativeTimeLabel(iso: string): string {
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

const issueCreatedAt = "2026-03-14T00:40:00.000Z";
const assignedAt = "2026-03-14T00:58:00.000Z";
const labelsChangedAt = "2026-03-14T01:05:00.000Z";
const firstCommentAt = "2026-03-14T01:18:00.000Z";
const filesAttachedAt = "2026-03-14T01:44:00.000Z";
const linkedChangeAt = "2026-03-14T02:06:00.000Z";
const secondCommentAt = "2026-03-14T02:28:00.000Z";

const issueTimelineEvents: TimelineEventData[] = [
  {
    id: "issue-created",
    type: "issue_created",
    author: {
      name: "박지훈",
      profileImageUrl: null,
    },
    createdAtLabel: toRelativeTimeLabel(issueCreatedAt),
  },
  {
    id: "issue-assigned",
    type: "assigned",
    author: {
      name: "박지훈",
      profileImageUrl: null,
    },
    createdAtLabel: toRelativeTimeLabel(assignedAt),
    addedNames: ["윤가은", "최민석", "이도윤"],
  },
  {
    id: "issue-labels-changed",
    type: "labels_changed",
    author: {
      name: "윤가은",
      profileImageUrl: null,
    },
    createdAtLabel: toRelativeTimeLabel(labelsChangedAt),
    addedLabels: [
      { name: "양산중", color: "#DC2626" },
      { name: "치수불량", color: "#EA580C" },
      { name: "출하보류", color: "#2563EB" },
    ],
  },
  {
    id: "issue-files-attached",
    type: "file_attached",
    author: {
      name: "윤가은",
      profileImageUrl: null,
    },
    createdAtLabel: toRelativeTimeLabel(filesAttachedAt),
    fileCount: 2,
    fileNames: [
      "HNG-260314-B_치수측정성적서.pdf",
      "OP20_금형기준핀_마모사진.jpg",
    ],
  },
  {
    id: "issue-change-linked",
    type: "cr_changed",
    author: {
      name: "최민석",
      profileImageUrl: null,
    },
    createdAtLabel: toRelativeTimeLabel(linkedChangeAt),
    linkedIssueCount: 1,
    linkedIssues: [
      {
        number: 52,
        title: "OP20 피어싱 금형 기준핀 규격 변경",
        type: "engineering_change",
      },
    ],
  },
];

const noop = () => undefined;
const noopAsync = async () => undefined;
const toTimelineEventItem = (event: TimelineEventData) => ({
  kind: "event" as const,
  id: event.id,
  event,
});

export const manufacturingIssueDetailArgs: IssueDetailScreenProps = {
  issue: {
    title: "프레스 2라인 도어 힌지 브라켓 홀 편차 발생",
    number: 184,
    state: "OPEN",
    createdAt: issueCreatedAt,
    isModified: true,
    body: `
      <p>야간조 생산분에서 우측 전도어 힌지 브라켓 체결 홀 위치가 도면 기준 ±0.20mm를 초과했습니다.</p>
      <ul>
        <li>대상 LOT: HNG-260314-B</li>
        <li>실측 결과: X축 +0.38mm, Y축 -0.11mm 편차</li>
        <li>영향 범위: 조립 불량 7건, 출하 대기 320대분</li>
      </ul>
      <p>원인은 금형 기준핀 마모로 추정되며, 예비핀 교체 전까지 해당 LOT는 출하 보류가 필요합니다.</p>
    `,
    createdBy: {
      id: "user-park-jihoon",
      name: "박지훈",
      email: "jihoon.park@fabbit.ai",
      profileImageUrl: null,
    },
    assignees: [
      {
        id: "user-yoon-gaeun",
        name: "윤가은",
        email: "gaeun.yoon@fabbit.ai",
        profileImageUrl: null,
      },
    ],
    labels: [
      {
        id: "label-mass-production",
        name: "양산중",
        colorHex: "#DC2626",
      },
      {
        id: "label-dimension",
        name: "치수불량",
        colorHex: "#EA580C",
      },
      {
        id: "label-hold",
        name: "출하보류",
        colorHex: "#2563EB",
      },
    ],
    linkedChanges: [
      {
        id: "change-52",
        number: 52,
        title: "OP20 피어싱 금형 기준핀 규격 변경",
        state: "SUBMITTED",
      },
    ],
    linkedIssues: [],
    relatedParts: [
      {
        id: "part-door-hinge-bracket-rh",
        partNumber: "DHB-4471-R",
        name: "도어 힌지 브라켓 RH",
        category: "프레스품",
      },
      {
        id: "part-op20-die",
        partNumber: "DIE-OP20-4471",
        name: "OP20 피어싱 금형",
        category: "금형",
      },
    ],
    attachments: [
      {
        id: "file-measurement-report",
        name: "HNG-260314-B_치수측정성적서.pdf",
        size: "2.4MB",
        type: "pdf",
        uploadedBy: "윤가은",
        uploadedAt: filesAttachedAt,
        url: "https://example.com/HNG-260314-B_measurement_report.pdf",
      },
      {
        id: "file-pin-photo",
        name: "OP20_금형기준핀_마모사진.jpg",
        size: "1.8MB",
        type: "image",
        uploadedBy: "윤가은",
        uploadedAt: filesAttachedAt,
        url: "https://example.com/OP20_die_pin_photo.jpg",
      },
    ],
  },
  timelineItems: [
    toTimelineEventItem(issueTimelineEvents[0]),
    toTimelineEventItem(issueTimelineEvents[1]),
    toTimelineEventItem(issueTimelineEvents[2]),
    {
      kind: "comment",
      id: "comment-qa-first-check",
      author: {
        id: "user-yoon-gaeun",
        name: "윤가은",
        email: "gaeun.yoon@fabbit.ai",
        profileImageUrl: null,
      },
      authorId: "user-yoon-gaeun",
      body: `
        <p>야간조 초품 20개 중 7개가 공차를 벗어났습니다.</p>
        <ul>
          <li>최대 편차: X축 +0.38mm</li>
          <li>조치: 해당 LOT 격리, 출하 보류 등록</li>
        </ul>
      `,
      createdAt: firstCommentAt,
      isModified: false,
      updatedAt: firstCommentAt,
    },
    toTimelineEventItem(issueTimelineEvents[3]),
    toTimelineEventItem(issueTimelineEvents[4]),
    {
      kind: "comment",
      id: "comment-tooling-check",
      author: {
        id: "user-choi-minseok",
        name: "최민석",
        email: "minseok.choi@fabbit.ai",
        profileImageUrl: null,
      },
      authorId: "user-choi-minseok",
      body: `
        <p>금형 기준핀 실측값이 Ø9.72까지 마모된 상태를 확인했습니다.</p>
        <p>예비핀 교체 후 시생산 30개를 재확인하겠습니다.</p>
      `,
      createdAt: secondCommentAt,
      isModified: true,
      updatedAt: "2026-03-14T02:39:00.000Z",
    },
  ],
  commentCount: 2,
  currentUser: {
    id: "user-yoon-gaeun",
    name: "윤가은",
    profileImageUrl: null,
  },
  availableMembers: [
    { id: "user-yoon-gaeun", name: "윤가은", email: "gaeun.yoon@fabbit.ai" },
    { id: "user-choi-minseok", name: "최민석", email: "minseok.choi@fabbit.ai" },
    { id: "user-lee-doyoon", name: "이도윤", email: "doyoon.lee@fabbit.ai" },
  ],
  availableLabels: [
    { id: "label-mass-production", name: "양산중", colorHex: "#DC2626" },
    { id: "label-dimension", name: "치수불량", colorHex: "#EA580C" },
    { id: "label-hold", name: "출하보류", colorHex: "#2563EB" },
  ],
  availableChanges: [
    { id: "change-52", number: 52, title: "OP20 피어싱 금형 기준핀 규격 변경", state: "SUBMITTED" },
    { id: "change-53", number: 53, title: "도어 힌지 브라켓 검사 빈도 상향", state: "DRAFT" },
  ],
  searchedParts: [
    { id: "part-door-hinge-bracket-rh", partNumber: "DHB-4471-R", name: "도어 힌지 브라켓 RH" },
    { id: "part-op20-die", partNumber: "DIE-OP20-4471", name: "OP20 피어싱 금형" },
    { id: "part-guide-pin", partNumber: "LOC-PIN-10", name: "금형 기준핀 10파이" },
  ],
  selectedAssigneeIds: ["user-yoon-gaeun"],
  selectedLabelIds: ["label-mass-production", "label-dimension", "label-hold"],
  selectedPartIds: ["part-door-hinge-bracket-rh", "part-op20-die"],
  linkedChangeIds: ["change-52"],
  onRequestMembers: noop,
  onRequestLabels: noop,
  onRequestParts: noop,
  onRequestChanges: noop,
  onSyncAssignees: noopAsync,
  onSyncLabels: noopAsync,
  onSyncParts: noopAsync,
  onSyncLinkedChanges: noopAsync,
  onPartsSearchChange: noop,
  onChangeSearchChange: noop,
  onLabelSearchChange: noop,
  onMemberSearchChange: noop,
  onBack: noop,
  onRetry: noop,
  onSaveIssue: noopAsync,
  onCreateComment: noopAsync,
  onUpdateComment: noopAsync,
  onDeleteComment: noopAsync,
  onCloseIssue: noopAsync,
  onReopenIssue: noopAsync,
  onNavigateToIssueMention: noop,
  onNavigateToChange: noop,
  onNavigateToPart: noop,
  onCreateLinkedChange: noop,
  onAttachFiles: noopAsync,
  onDeleteFile: noopAsync,
};
