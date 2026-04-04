import type { TimelineEventData } from "@fabbit/components";

interface TimelineActivityRef {
  id: string;
  label: string;
  meta?: Record<string, unknown> | null;
  type: string;
}

interface TimelineActivityActor {
  fullName: string;
  profileImageUrl?: string | null;
}

interface TimelineActivitySource {
  action: string;
  actor: TimelineActivityActor | null;
  createdAt: string;
  detail: Record<string, unknown> | null;
  id: string;
}

function isTimelineActivityRef(value: unknown): value is TimelineActivityRef {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      "type" in value &&
      "label" in value,
  );
}

function extractRefs(value: unknown): TimelineActivityRef[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  if (!isTimelineActivityRef(value[0])) {
    return null;
  }

  return value as TimelineActivityRef[];
}

function isChangesDetail(detail: Record<string, unknown>) {
  return "changes" in detail && typeof detail.changes === "object" && detail.changes !== null;
}

function getChangeValue(
  detail: Record<string, unknown>,
  ...fields: string[]
): { new?: string; old?: string } | null {
  if (!isChangesDetail(detail)) {
    return null;
  }

  const changes = detail.changes as Record<
    string,
    { new?: string; new_value?: string; old?: string; old_value?: string }
  >;

  for (const field of fields) {
    if (changes[field]) {
      const raw = changes[field];
      return {
        new: raw.new ?? raw.new_value,
        old: raw.old ?? raw.old_value,
      };
    }
  }

  return null;
}

function toIssueType(raw?: string): "engineering_change" | "issue" | undefined {
  if (!raw) {
    return undefined;
  }

  const upper = raw.toUpperCase();

  if (upper === "CHANGE_REQUEST" || upper === "CR") {
    return "engineering_change";
  }

  return "issue";
}

function getIssueLikeTitle(
  label: string,
  meta?: Record<string, unknown> | null,
) {
  const metaTitle = meta?.title;

  if (typeof metaTitle === "string" && metaTitle.trim()) {
    return metaTitle;
  }

  return label.replace(/^#\d+\s*/, "").trim();
}

function toLinkedItems(refs: TimelineActivityRef[] | null) {
  return refs?.map((ref) => ({
    number: (ref.meta?.number as number) ?? 0,
    title: getIssueLikeTitle(ref.label, ref.meta),
    type: toIssueType(ref.type),
  }));
}

function toActor(actor: TimelineActivityActor | null): TimelineEventData["author"] {
  return {
    name: actor?.fullName ?? "알 수 없는 사용자",
    profileImageUrl: actor?.profileImageUrl ?? null,
  };
}

export function formatTimelineRelativeTime(iso: string): string {
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

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
}

export function mapTimelineActivityToEvent(item: TimelineActivitySource): TimelineEventData | null {
  const action = item.action.toLowerCase();
  const detail = item.detail ?? {};
  const author = toActor(item.actor);
  const createdAtLabel = formatTimelineRelativeTime(item.createdAt);

  if (action === "issue:created") {
    const refs = extractRefs(detail.refs);

    return {
      id: item.id,
      type: "issue_created",
      author,
      createdAtLabel,
      issueNumber: (refs?.[0]?.meta?.number as number) ?? (detail.number as number | undefined),
      issueTitle: refs?.[0] ? getIssueLikeTitle(refs[0].label, refs[0].meta) : (detail.title as string | undefined),
    };
  }

  if (action === "issue:closed") {
    return { id: item.id, type: "status_change", author, createdAtLabel, content: "closed" };
  }

  if (action === "issue:reopened") {
    return { id: item.id, type: "status_change", author, createdAtLabel, content: "open" };
  }

  if (action === "issue:state_changed") {
    const change = getChangeValue(detail, "state");
    const nextState = (change?.new ?? (detail.to as string | undefined))?.toLowerCase();

    return {
      id: item.id,
      type: "status_change",
      author,
      createdAtLabel,
      content: nextState === "open" ? "open" : "closed",
    };
  }

  if (action === "cr:state_changed" || action === "engineering_change:state_changed") {
    const change = getChangeValue(detail, "state", "cr_state");
    const from = (change?.old ?? (detail.from as string | undefined) ?? "").toUpperCase();
    const to = (change?.new ?? (detail.to as string | undefined) ?? "").toUpperCase();

    return {
      id: item.id,
      type: "cr_state_changed",
      author,
      createdAtLabel,
      content: { from, to },
    };
  }

  if (action === "cr:created") {
    const refs = extractRefs(detail.refs);

    return {
      id: item.id,
      type: "cr_created",
      author,
      createdAtLabel,
      issueNumber: (refs?.[0]?.meta?.number as number) ?? (detail.number as number | undefined),
      issueTitle: refs?.[0] ? getIssueLikeTitle(refs[0].label, refs[0].meta) : (detail.title as string | undefined),
    };
  }

  if (action === "cr:merged") {
    const refs = extractRefs(detail.refs);

    return {
      id: item.id,
      type: "cr_merged",
      author,
      createdAtLabel,
      issueNumber: (refs?.[0]?.meta?.number as number) ?? (detail.number as number | undefined),
      issueTitle: refs?.[0] ? getIssueLikeTitle(refs[0].label, refs[0].meta) : (detail.title as string | undefined),
    };
  }

  if (action === "issue:part_changed") {
    const addedRefs = extractRefs(detail.added);
    const removedRefs = extractRefs(detail.removed);
    const legacyAddedFromList = ((detail.added as { part_number: string }[] | undefined) ?? []).map(
      (part) => part.part_number,
    );
    const legacyRemovedFromList = ((detail.removed as { part_number: string }[] | undefined) ?? []).map(
      (part) => part.part_number,
    );
    const legacyAdded =
      legacyAddedFromList.length > 0
        ? legacyAddedFromList
        : (detail.addedPartNumbers as string[] | undefined);
    const legacyRemoved =
      legacyRemovedFromList.length > 0
        ? legacyRemovedFromList
        : (detail.removedPartNumbers as string[] | undefined);

    return {
      id: item.id,
      type: "part_added",
      author,
      createdAtLabel,
      addedPartCount: addedRefs?.length ?? (detail.addedPartCount as number | undefined),
      removedPartCount: removedRefs?.length ?? (detail.removedPartCount as number | undefined),
      addedPartNumbers: addedRefs?.map((ref) => ref.label) ?? (legacyAdded?.length ? legacyAdded : undefined),
      removedPartNumbers: removedRefs?.map((ref) => ref.label) ?? (legacyRemoved?.length ? legacyRemoved : undefined),
    };
  }

  if (action === "issue:label_changed") {
    const addedRefs = extractRefs(detail.added);
    const removedRefs = extractRefs(detail.removed);
    const legacyAddedFromList = (detail.added as { color: string; name: string }[] | undefined) ?? [];
    const legacyRemovedFromList = (detail.removed as { color: string; name: string }[] | undefined) ?? [];
    const legacyAdded =
      legacyAddedFromList.length > 0
        ? legacyAddedFromList
        : (detail.addedLabels as { color: string; name: string }[] | undefined);
    const legacyRemoved =
      legacyRemovedFromList.length > 0
        ? legacyRemovedFromList
        : (detail.removedLabels as { color: string; name: string }[] | undefined);

    return {
      id: item.id,
      type: "labels_changed",
      author,
      createdAtLabel,
      addedLabels:
        addedRefs?.map((ref) => ({
          name: ref.label,
          color: (ref.meta?.color as string) ?? "",
        })) ?? (legacyAdded?.length ? legacyAdded : undefined),
      removedLabels:
        removedRefs?.map((ref) => ({
          name: ref.label,
          color: (ref.meta?.color as string) ?? "",
        })) ?? (legacyRemoved?.length ? legacyRemoved : undefined),
    };
  }

  if (action === "issue:assignee_changed" || action === "issue:reviewer_changed") {
    const addedRefs = extractRefs(detail.added);
    const removedRefs = extractRefs(detail.removed);
    const legacyAddedFromList = ((detail.added as { name: string }[] | undefined) ?? []).map(
      (user) => user.name,
    );
    const legacyRemovedFromList = ((detail.removed as { name: string }[] | undefined) ?? []).map(
      (user) => user.name,
    );
    const legacyAdded =
      legacyAddedFromList.length > 0 ? legacyAddedFromList : (detail.addedNames as string[] | undefined);
    const legacyRemoved =
      legacyRemovedFromList.length > 0 ? legacyRemovedFromList : (detail.removedNames as string[] | undefined);

    return {
      id: item.id,
      type: action === "issue:reviewer_changed" ? "reviewer_changed" : "assigned",
      author,
      createdAtLabel,
      addedNames: addedRefs?.map((ref) => ref.label) ?? (legacyAdded?.length ? legacyAdded : undefined),
      removedNames: removedRefs?.map((ref) => ref.label) ?? (legacyRemoved?.length ? legacyRemoved : undefined),
    };
  }

  if (action === "issue:file_attached") {
    const refs = extractRefs(detail.refs) ?? extractRefs(detail.added);
    const legacyFiles = ((detail.files as { original_name: string }[] | undefined) ?? []).map(
      (file) => file.original_name,
    );
    const fileNames = refs?.map((ref) => ref.label) ?? (legacyFiles.length > 0 ? legacyFiles : detail.fileNames as string[] | undefined);

    return {
      id: item.id,
      type: "file_attached",
      author,
      createdAtLabel,
      fileCount: refs?.length ?? (detail.fileCount as number | undefined),
      fileNames,
    };
  }

  if (action === "issue:file_detached") {
    const refs = extractRefs(detail.refs) ?? extractRefs(detail.removed);
    const fallbackNames = refs?.map((ref) => ref.label)
      ?? ((detail.file_name as string | undefined) ? [detail.file_name as string] : undefined)
      ?? (detail.fileNames as string[] | undefined);

    return {
      id: item.id,
      type: "file_detached",
      author,
      createdAtLabel,
      fileCount: refs?.length ?? (detail.fileCount as number | undefined),
      fileNames: fallbackNames,
    };
  }

  if (action === "issue:cr_changed") {
    const addedRefs = extractRefs(detail.added);
    const removedRefs = extractRefs(detail.removed);
    const addedItems = toLinkedItems(addedRefs);
    const removedItems = toLinkedItems(removedRefs);

    if (addedItems && addedItems.length > 0) {
      return {
        id: item.id,
        type: "cr_changed",
        author,
        createdAtLabel,
        linkedIssueCount: addedItems.length,
        linkedIssues: addedItems,
      };
    }

    if (removedItems && removedItems.length > 0) {
      return {
        id: item.id,
        type: "cr_changed",
        author,
        createdAtLabel,
        linkedIssueCount: -removedItems.length,
        linkedIssues: removedItems,
      };
    }

    return {
      id: item.id,
      type: "cr_changed",
      author,
      createdAtLabel,
      linkedIssueCount: detail.linkedIssueCount as number | undefined,
      linkedIssues: detail.linkedIssues as TimelineEventData["linkedIssues"],
    };
  }

  if (action === "cr:issue_changed") {
    const addedRefs = extractRefs(detail.added);
    const removedRefs = extractRefs(detail.removed);

    if (addedRefs) {
      const linkedItems = toLinkedItems(addedRefs);

      return {
        id: item.id,
        type: "cr_issue_linked",
        author,
        createdAtLabel,
        linkedIssueCount: linkedItems?.length ?? 0,
        linkedIssues: linkedItems,
      };
    }

    if (removedRefs) {
      const unlinkedItems = toLinkedItems(removedRefs);

      return {
        id: item.id,
        type: "cr_issue_unlinked",
        author,
        createdAtLabel,
        linkedIssueCount: unlinkedItems?.length ?? 0,
        linkedIssues: unlinkedItems,
      };
    }

    return {
      id: item.id,
      type: "cr_issue_linked",
      author,
      createdAtLabel,
      linkedIssueCount: detail.linkedIssueCount as number | undefined,
      linkedIssues: detail.linkedIssues as TimelineEventData["linkedIssues"],
    };
  }

  if (action === "issue:mentioned") {
    const refs = extractRefs(detail.refs);

    if (refs && refs.length > 0) {
      const ref = refs[0];

      return {
        id: item.id,
        type: "issue_mentioned",
        author,
        createdAtLabel,
        linkedIssues: [
          {
            number: (ref.meta?.number as number) ?? 0,
            title: getIssueLikeTitle(ref.label, ref.meta),
            type: toIssueType(ref.type),
          },
        ],
        isComment: (ref.meta?.is_comment as boolean) ?? (detail.is_comment as boolean | undefined) ?? false,
      };
    }

    return {
      id: item.id,
      type: "issue_mentioned",
      author,
      createdAtLabel,
      linkedIssues: (detail.linkedIssues as TimelineEventData["linkedIssues"] | undefined) ?? [
        {
          number: detail.source_number as number,
          title: detail.source_title as string,
          type: toIssueType(detail.source_issue_type as string | undefined),
        },
      ],
      isComment: (detail.is_comment as boolean | undefined) ?? (detail.isComment as boolean | undefined) ?? false,
    };
  }

  // EC 단계 담당자 변경
  if (action === "engineering_change:step_changed") {
    const change = getChangeValue(detail, "status");
    const stepAction = change?.new ?? (detail.status as string | undefined);
    const refs = extractRefs(detail.refs);
    const assigneeName = refs?.[0]?.label ?? (detail.assignee_name as string | undefined);
    const stepType = refs?.[0]?.meta?.step_type as string | undefined ?? (detail.step_type as string | undefined);

    return {
      id: item.id,
      type: "cr_step_changed",
      author,
      createdAtLabel,
      stepAction: stepAction ?? undefined,
      stepAssigneeName: assigneeName ?? undefined,
      stepType: stepType ?? undefined,
    };
  }

  // EC 연결 이슈 변경
  if (action === "engineering_change:issue_changed") {
    const addedRefs = extractRefs(detail.added);
    const removedRefs = extractRefs(detail.removed);

    if (addedRefs) {
      return {
        id: item.id,
        type: "cr_issue_linked",
        author,
        createdAtLabel,
        linkedIssueCount: addedRefs.length,
        linkedIssues: toLinkedItems(addedRefs),
      };
    }

    if (removedRefs) {
      return {
        id: item.id,
        type: "cr_issue_unlinked",
        author,
        createdAtLabel,
        linkedIssueCount: removedRefs.length,
        linkedIssues: toLinkedItems(removedRefs),
      };
    }

    return {
      id: item.id,
      type: "cr_issue_linked",
      author,
      createdAtLabel,
      linkedIssueCount: detail.linkedIssueCount as number | undefined,
      linkedIssues: detail.linkedIssues as TimelineEventData["linkedIssues"],
    };
  }

  // EC 파일 첨부
  if (action === "engineering_change:file_attached") {
    const refs = extractRefs(detail.refs) ?? extractRefs(detail.added);
    const fileNames = refs?.map((ref) => ref.label) ?? (detail.fileNames as string[] | undefined);

    return {
      id: item.id,
      type: "file_attached",
      author,
      createdAtLabel,
      fileCount: refs?.length ?? (detail.fileCount as number | undefined),
      fileNames,
    };
  }

  // EC 파일 제거
  if (action === "engineering_change:file_detached") {
    const refs = extractRefs(detail.refs) ?? extractRefs(detail.removed);
    const fileNames = refs?.map((ref) => ref.label)
      ?? ((detail.file_name as string | undefined) ? [detail.file_name as string] : undefined)
      ?? (detail.fileNames as string[] | undefined);

    return {
      id: item.id,
      type: "file_detached",
      author,
      createdAtLabel,
      fileCount: refs?.length ?? (detail.fileCount as number | undefined),
      fileNames,
    };
  }

  // EC 멘션
  if (action === "engineering_change:mentioned") {
    const refs = extractRefs(detail.refs);

    if (refs && refs.length > 0) {
      const ref = refs[0];

      return {
        id: item.id,
        type: "issue_mentioned",
        author,
        createdAtLabel,
        linkedIssues: [
          {
            number: (ref.meta?.number as number) ?? 0,
            title: getIssueLikeTitle(ref.label, ref.meta),
            type: toIssueType(ref.type),
          },
        ],
        isComment: (ref.meta?.is_comment as boolean) ?? false,
      };
    }

    return {
      id: item.id,
      type: "issue_mentioned",
      author,
      createdAtLabel,
      linkedIssues: (detail.linkedIssues as TimelineEventData["linkedIssues"] | undefined) ?? [],
      isComment: (detail.is_comment as boolean | undefined) ?? false,
    };
  }

  // EC 부품 리비전 변경
  if (action === "engineering_change:part_revision_changed") {
    const addedRefs = extractRefs(detail.added);
    const removedRefs = extractRefs(detail.removed);

    return {
      id: item.id,
      type: "cr_part_revision_changed",
      author,
      createdAtLabel,
      addedPartCount: addedRefs?.length,
      removedPartCount: removedRefs?.length,
      addedPartNumbers: addedRefs?.map((ref) => ref.label),
      removedPartNumbers: removedRefs?.map((ref) => ref.label),
    };
  }

  return {
    id: item.id,
    type: "referenced",
    author,
    createdAtLabel,
    ref: item.action,
  };
}
