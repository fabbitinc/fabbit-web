import type { IssueDto, ChangeDto, IssueTimelineItemDto, TimelineUserDto, UserSummaryDto } from "@/api/types";
import type {
  ChangeRequest,
  TimelineEvent,
  TimelineAuthor,
} from "@/pages/projects/changeRequestMock";

// ============================================================
// 헬퍼
// ============================================================

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function getAttachmentType(
  fileName: string,
  contentType: string,
): "pdf" | "step" | "dwg" | "xlsx" | "image" | "other" {
  const normalizedFileName = fileName.toLowerCase();
  const normalizedContentType = contentType.toLowerCase();

  if (normalizedContentType.includes("pdf") || normalizedFileName.endsWith(".pdf")) return "pdf";
  if (normalizedContentType.startsWith("image/")) return "image";
  if (normalizedFileName.endsWith(".step") || normalizedFileName.endsWith(".stp")) return "step";
  if (normalizedFileName.endsWith(".dwg")) return "dwg";
  if (normalizedContentType.includes("spreadsheet") || /\.(xlsx?|csv)$/.test(normalizedFileName))
    return "xlsx";
  return "other";
}

function toIssueStatus(state: string): "open" | "closed" {
  return state.toLowerCase() === "open" ? "open" : "closed";
}

function toIssueAuthor(issue: IssueDto): string {
  if (issue.createdBy) return issue.createdBy.fullName;
  return "삭제된 사용자";
}

function toChangeStatus(state: string): "draft" | "open" | "closed" | "merged" {
  const lower = state.toLowerCase();
  if (lower === "draft") return "draft";
  if (lower === "open" || lower === "submitted") return "open";
  if (lower === "merged") return "merged";
  return "closed";
}

function toChangeAuthor(change: ChangeDto): string {
  if (change.createdBy) return change.createdBy.fullName;
  return "삭제된 사용자";
}

// ============================================================
// 타임라인 변환
// ============================================================

// Ref: API 응답의 구조화된 참조 엔티티 (DiffDetail, RefsDetail에서 사용)
interface TimelineRef {
  id: string;
  type: string;
  label: string;
  meta?: Record<string, unknown> | null;
}

function isRef(obj: unknown): obj is TimelineRef {
  return !!obj && typeof obj === "object" && "id" in obj && "type" in obj && "label" in obj;
}

/** Ref 배열이면 추출, 아니면 null (기존 포맷 fallback용) */
function extractRefs(arr: unknown): TimelineRef[] | null {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  if (!isRef(arr[0])) return null;
  return arr as TimelineRef[];
}

/** ChangesDetail 구조 여부 확인: { changes: { field: { old, new } } } */
function isChangesDetail(detail: Record<string, unknown>): boolean {
  return "changes" in detail && typeof detail.changes === "object" && detail.changes !== null;
}

/** ChangesDetail에서 특정 필드의 old/new 값 추출 */
function getChangeValue(detail: Record<string, unknown>, ...fields: string[]): { old?: string; new?: string } | null {
  if (!isChangesDetail(detail)) return null;
  const changes = detail.changes as Record<string, { old?: string; new?: string }>;
  for (const field of fields) {
    if (changes[field]) return changes[field];
  }
  return null;
}

interface TimelineSource {
  createdBy: UserSummaryDto | null;
  assignees: { id: string; fullName: string }[];
}

function toDisplayActor(
  id: string | null | undefined,
  users: Record<string, TimelineUserDto>,
  source: TimelineSource,
): TimelineAuthor {
  if (!id) return { name: "삭제된 사용자" };

  const user = users[id];
  if (user) return { name: user.fullName, profileImageUrl: user.profileImageUrl };

  if (source.createdBy && id === source.createdBy.id) {
    return { name: source.createdBy.fullName, profileImageUrl: source.createdBy.profileImageUrl };
  }

  const assignee = source.assignees.find((item) => item.id === id);
  if (assignee) return { name: assignee.fullName };

  return { name: id.slice(0, 8) };
}

function toIssueType(raw?: string): "issue" | "change_request" | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  if (upper === "CHANGE_REQUEST" || upper === "CR") return "change_request";
  return "issue";
}

export function toTimelineEvents(
  items: IssueTimelineItemDto[],
  users: Record<string, TimelineUserDto>,
  source: TimelineSource,
): TimelineEvent[] {
  return items.map((item) => {
    if (item.type === "comment") {
      return {
        id: item.id,
        type: "comment",
        author: toDisplayActor(item.authorId, users, source),
        authorId: item.authorId,
        createdAt: item.createdAt,
        content: item.body,
        isModified: item.isModified ?? false,
      };
    }

    const action = item.action.toLowerCase();
    const detail = item.detail ?? {};
    const author = toDisplayActor(item.actorId, users, source);

    if (action === "issue:created") {
      const refs = extractRefs(detail.refs);
      return {
        id: item.id, type: "issue_created", author, createdAt: item.createdAt,
        issueNumber: (refs?.[0]?.meta?.number as number) ?? (detail.number as number | undefined),
        issueTitle: (refs?.[0]?.meta?.title as string) ?? refs?.[0]?.label ?? (detail.title as string | undefined),
      };
    }

    if (action === "issue:closed") {
      return { id: item.id, type: "status_change", author, createdAt: item.createdAt, content: "closed" };
    }

    if (action === "issue:reopened") {
      return { id: item.id, type: "status_change", author, createdAt: item.createdAt, content: "open" };
    }

    if (action === "issue:state_changed") {
      const change = getChangeValue(detail, "state");
      const to = (change?.new ?? (detail.to as string | undefined))?.toLowerCase();
      return {
        id: item.id, type: "status_change", author, createdAt: item.createdAt,
        content: to === "open" ? "open" : "closed",
      };
    }

    if (action === "cr:state_changed") {
      const change = getChangeValue(detail, "state", "cr_state");
      const from = (change?.old ?? (detail.from as string) ?? "").toUpperCase();
      const to = (change?.new ?? (detail.to as string) ?? "").toUpperCase();
      return {
        id: item.id, type: "cr_state_changed", author, createdAt: item.createdAt,
        content: { from, to },
      };
    }

    if (action === "cr:created") {
      const refs = extractRefs(detail.refs);
      return {
        id: item.id, type: "cr_created", author, createdAt: item.createdAt,
        issueNumber: (refs?.[0]?.meta?.number as number) ?? (detail.number as number | undefined),
        issueTitle: (refs?.[0]?.meta?.title as string) ?? refs?.[0]?.label ?? (detail.title as string | undefined),
      };
    }

    if (action === "cr:merged") {
      const refs = extractRefs(detail.refs);
      return {
        id: item.id, type: "cr_merged", author, createdAt: item.createdAt,
        issueNumber: (refs?.[0]?.meta?.number as number) ?? (detail.number as number | undefined),
        issueTitle: (refs?.[0]?.meta?.title as string) ?? refs?.[0]?.label ?? (detail.title as string | undefined),
      };
    }

    if (action === "issue:part_changed") {
      const addedRefs = extractRefs(detail.added);
      const removedRefs = extractRefs(detail.removed);

      if (addedRefs || removedRefs) {
        // 새 Ref 포맷
        return {
          id: item.id, type: "part_added", author, createdAt: item.createdAt,
          addedPartCount: addedRefs?.length || undefined,
          removedPartCount: removedRefs?.length || undefined,
          addedPartNumbers: addedRefs?.map((r) => r.label),
          removedPartNumbers: removedRefs?.map((r) => r.label),
        };
      }

      // 기존 포맷 fallback
      const added = (detail.added as { part_id: string; part_number: string }[] | undefined) ?? [];
      const removed = (detail.removed as { part_id: string; part_number: string }[] | undefined) ?? [];
      return {
        id: item.id, type: "part_added", author, createdAt: item.createdAt,
        addedPartCount: added.length || undefined,
        removedPartCount: removed.length || undefined,
        addedPartNumbers: added.length > 0 ? added.map((p) => p.part_number) : undefined,
        removedPartNumbers: removed.length > 0 ? removed.map((p) => p.part_number) : undefined,
      };
    }

    if (action === "issue:label_changed") {
      const addedRefs = extractRefs(detail.added);
      const removedRefs = extractRefs(detail.removed);
      const added = addedRefs
        ? addedRefs.map((r) => ({ name: r.label, color: (r.meta?.color as string) ?? "" }))
        : ((detail.added as { name: string; color: string }[] | undefined) ?? []);
      const removed = removedRefs
        ? removedRefs.map((r) => ({ name: r.label, color: (r.meta?.color as string) ?? "" }))
        : ((detail.removed as { name: string; color: string }[] | undefined) ?? []);
      return { id: item.id, type: "labels_changed", author, createdAt: item.createdAt, addedLabels: added, removedLabels: removed };
    }

    if (action === "issue:assignee_changed") {
      const addedRefs = extractRefs(detail.added);
      const removedRefs = extractRefs(detail.removed);
      const addedNames = addedRefs?.map((r) => r.label)
        ?? ((detail.added as { user_id: string; name: string }[] | undefined) ?? []).map((u) => u.name);
      const removedNames = removedRefs?.map((r) => r.label)
        ?? ((detail.removed as { user_id: string; name: string }[] | undefined) ?? []).map((u) => u.name);
      return {
        id: item.id, type: "assigned", author, createdAt: item.createdAt,
        addedNames: addedNames.length > 0 ? addedNames : undefined,
        removedNames: removedNames.length > 0 ? removedNames : undefined,
      };
    }

    if (action === "issue:reviewer_changed") {
      const addedRefs = extractRefs(detail.added);
      const removedRefs = extractRefs(detail.removed);
      const addedNames = addedRefs?.map((r) => r.label)
        ?? ((detail.added as { user_id: string; name: string }[] | undefined) ?? []).map((u) => u.name);
      const removedNames = removedRefs?.map((r) => r.label)
        ?? ((detail.removed as { user_id: string; name: string }[] | undefined) ?? []).map((u) => u.name);
      return {
        id: item.id, type: "reviewer_changed", author, createdAt: item.createdAt,
        addedNames: addedNames.length > 0 ? addedNames : undefined,
        removedNames: removedNames.length > 0 ? removedNames : undefined,
      };
    }

    if (action === "issue:file_attached") {
      const refs = extractRefs(detail.refs) ?? extractRefs(detail.added);
      if (refs) {
        return {
          id: item.id, type: "file_attached", author, createdAt: item.createdAt,
          fileCount: refs.length,
          fileNames: refs.map((r) => r.label),
        };
      }
      const files = (detail.files as { file_id: string; original_name: string }[] | undefined) ?? [];
      return {
        id: item.id, type: "file_attached", author, createdAt: item.createdAt,
        fileCount: files.length,
        fileNames: files.length > 0 ? files.map((f) => f.original_name) : undefined,
      };
    }

    if (action === "issue:file_detached") {
      const refs = extractRefs(detail.refs) ?? extractRefs(detail.removed);
      if (refs) {
        return {
          id: item.id, type: "file_detached", author, createdAt: item.createdAt,
          fileCount: refs.length, fileNames: refs.map((r) => r.label),
        };
      }
      const fileName = detail.file_name as string | undefined;
      return {
        id: item.id, type: "file_detached", author, createdAt: item.createdAt,
        fileCount: 1, fileNames: fileName ? [fileName] : undefined,
      };
    }

    if (action === "issue:cr_changed") {
      const addedRefs = extractRefs(detail.added);
      const removedRefs = extractRefs(detail.removed);

      const addedItems = addedRefs?.map((r) => ({
        number: (r.meta?.number as number) ?? 0,
        title: (r.meta?.title as string) ?? r.label,
        type: toIssueType(r.type),
      }));
      const removedItems = removedRefs?.map((r) => ({
        number: (r.meta?.number as number) ?? 0,
        title: (r.meta?.title as string) ?? r.label,
        type: toIssueType(r.type),
      }));

      if (addedItems && addedItems.length > 0) {
        return {
          id: item.id, type: "cr_changed", author, createdAt: item.createdAt,
          linkedIssueCount: addedItems.length, linkedIssues: addedItems,
        };
      }
      if (removedItems && removedItems.length > 0) {
        return {
          id: item.id, type: "cr_changed", author, createdAt: item.createdAt,
          linkedIssueCount: -(removedItems.length), linkedIssues: removedItems,
        };
      }

      return {
        id: item.id, type: "cr_changed", author, createdAt: item.createdAt,
        linkedIssueCount: 0,
      };
    }

    if (action === "cr:issue_changed") {
      const addedRefs = extractRefs(detail.added);
      const removedRefs = extractRefs(detail.removed);

      if (addedRefs) {
        const linkedItems = addedRefs.map((r) => ({
          number: (r.meta?.number as number) ?? 0,
          title: (r.meta?.title as string) ?? r.label,
          type: toIssueType(r.type),
        }));
        return {
          id: item.id, type: "cr_issue_linked", author, createdAt: item.createdAt,
          linkedIssueCount: linkedItems.length, linkedIssues: linkedItems,
        };
      }

      if (removedRefs) {
        const unlinkedItems = removedRefs.map((r) => ({
          number: (r.meta?.number as number) ?? 0,
          title: (r.meta?.title as string) ?? r.label,
          type: toIssueType(r.type),
        }));
        return {
          id: item.id, type: "cr_issue_unlinked", author, createdAt: item.createdAt,
          linkedIssueCount: unlinkedItems.length, linkedIssues: unlinkedItems,
        };
      }

      // 기존 포맷 fallback
      const linkedIssues = (detail.linked_issues as { issue_id: string; number: number; title: string; type?: string }[] | undefined) ?? [];
      const unlinkedIssues = (detail.unlinked_issues as { issue_id: string; number: number; title: string; type?: string }[] | undefined) ?? [];
      const crNumber = detail.cr_number as number | undefined;
      const crTitle = detail.cr_title as string | undefined;
      const crType = detail.cr_type as string | undefined;

      if (linkedIssues.length > 0 || (unlinkedIssues.length === 0 && crNumber != null)) {
        const linkedItems = linkedIssues.length > 0
          ? linkedIssues.map((i) => ({ number: i.number, title: i.title, type: toIssueType(i.type) }))
          : crNumber != null ? [{ number: crNumber, title: crTitle ?? "", type: toIssueType(crType) }] : undefined;
        return {
          id: item.id, type: "cr_issue_linked", author, createdAt: item.createdAt,
          linkedIssueCount: linkedItems?.length ?? 0, linkedIssues: linkedItems,
        };
      }

      if (unlinkedIssues.length > 0) {
        const unlinkedItems = unlinkedIssues.map((i) => ({ number: i.number, title: i.title, type: toIssueType(i.type) }));
        return {
          id: item.id, type: "cr_issue_unlinked", author, createdAt: item.createdAt,
          linkedIssueCount: unlinkedItems.length, linkedIssues: unlinkedItems,
        };
      }

      return {
        id: item.id, type: "cr_issue_linked", author, createdAt: item.createdAt,
        linkedIssueCount: 0,
      };
    }

    if (action === "issue:mentioned") {
      const refs = extractRefs(detail.refs);
      if (refs && refs.length > 0) {
        const r = refs[0];
        return {
          id: item.id, type: "issue_mentioned", author, createdAt: item.createdAt,
          linkedIssues: [{
            number: (r.meta?.number as number) ?? 0,
            title: (r.meta?.title as string) ?? r.label,
            type: toIssueType(r.type),
          }],
          isComment: (r.meta?.is_comment as boolean) ?? (detail.is_comment as boolean | undefined) ?? false,
        };
      }
      const sourceNumber = detail.source_number as number;
      const sourceTitle = detail.source_title as string;
      const sourceType = toIssueType(detail.source_issue_type as string | undefined);
      return {
        id: item.id, type: "issue_mentioned", author, createdAt: item.createdAt,
        linkedIssues: [{ number: sourceNumber, title: sourceTitle, type: sourceType }],
        isComment: (detail.is_comment as boolean | undefined) ?? false,
      };
    }

    return { id: item.id, type: "referenced", author, createdAt: item.createdAt, ref: item.action };
  });
}

// ============================================================
// DTO → ChangeRequest 변환
// ============================================================

export function toIssueChangeRequest(
  issue: IssueDto,
  timeline: TimelineEvent[] = [],
): ChangeRequest {
  return {
    id: issue.id,
    number: issue.number,
    type: "issue",
    title: issue.title,
    status: toIssueStatus(issue.state),
    author: toIssueAuthor(issue),
    createdAt: issue.createdAt,
    labels: issue.labels.map((label) => ({ id: label.id, name: label.name, colorHex: label.color })),
    assignees: issue.assignees.map((a) => ({ id: a.id, name: a.fullName, profileImageUrl: a.profileImageUrl })),
    reviewers: [],
    description: issue.body ?? "",
    isModified: issue.isModified ?? false,
    timeline,
    attachments: issue.files.map((file) => ({
      id: file.fileId,
      name: file.originalName,
      size: formatFileSize(file.fileSize),
      type: getAttachmentType(file.originalName, file.contentType),
      uploadedBy: toIssueAuthor(issue),
      uploadedAt: file.createdAt,
    })),
    relatedParts: issue.parts.map((part) => ({
      id: part.id, partNumber: part.partNumber, name: part.name ?? "이름 없음",
    })),
    commentsCount: issue.commentsCount,
    linkedChanges: issue.linkedChanges.map((lc) => ({
      id: lc.id, number: lc.number, title: lc.title, state: lc.crState ?? lc.state,
    })),
    linkedIssues: [],
  };
}

export function toChangeChangeRequest(
  change: ChangeDto,
  timeline: TimelineEvent[] = [],
): ChangeRequest {
  return {
    id: change.id,
    number: change.number,
    type: "pr",
    title: change.title,
    status: toChangeStatus(change.crState),
    author: toChangeAuthor(change),
    createdAt: change.createdAt,
    labels: change.labels.map((label) => ({ id: label.id, name: label.name, colorHex: label.color })),
    assignees: change.assignees.map((a) => ({ id: a.id, name: a.fullName, profileImageUrl: a.profileImageUrl })),
    reviewers: change.reviewers.map((r) => ({ id: r.id, name: r.fullName, profileImageUrl: r.profileImageUrl })),
    description: change.body ?? "",
    isModified: change.isModified ?? false,
    timeline,
    attachments: change.files.map((file) => ({
      id: file.fileId,
      name: file.originalName,
      size: formatFileSize(file.fileSize),
      type: getAttachmentType(file.originalName, file.contentType),
      uploadedBy: toChangeAuthor(change),
      uploadedAt: file.createdAt,
    })),
    relatedParts: change.parts.map((part) => ({
      id: part.id, partNumber: part.partNumber, name: part.name ?? "이름 없음",
    })),
    commentsCount: change.commentsCount,
    linkedChanges: [],
    linkedIssues: change.linkedIssues.map((li) => ({
      id: li.id, number: li.number, title: li.title, state: li.state,
    })),
  };
}
