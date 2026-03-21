import {
  addFiles as addIssueFilesApi,
  closeIssue as closeIssueApi,
  createComment as createIssueCommentApi,
  createIssue as createIssueApi,
  deleteComment as deleteIssueCommentApi,
  deleteFile1 as deleteIssueFileApi,
  getIssue as getIssueApi,
  getTimeline as getIssueTimelineApi,
  reopenIssue as reopenIssueApi,
  syncAssignees as syncIssueAssigneesApi,
  syncLabels as syncIssueLabelsApi,
  syncLinkedEngineeringChanges as syncIssueChangesApi,
  syncParts as syncIssuePartsApi,
  updateComment as updateIssueCommentApi,
  updateIssue as updateIssueApi,
} from "@/api/generated/orval/issues/issues";
import type {
  AddIssueFilesRequestDto,
  CreateIssueCommentRequestDto,
  CreateIssueCommentResponseDto,
  CreateIssueRequestDto,
  IssueDetailResponseDto,
  IssueTimelineResponseDto,
  SyncIssueAssigneesRequestDto,
  SyncIssueAssigneesResponseDto,
  SyncIssueChangesRequestDto,
  SyncIssueChangesResponseDto,
  SyncIssueLabelsRequestDto,
  SyncIssueLabelsResponseDto,
  SyncIssuePartsRequestDto,
  SyncIssuePartsResponseDto,
  UpdateIssueCommentRequestDto,
  UpdateIssueCommentResponseDto,
  UpdateIssueRequestDto,
} from "@/features/issue/api/issue.types";
import type {
  IssueDetailModel,
  IssueFileModel,
  IssueLabelModel,
  IssueLinkedChangeModel,
  IssuePartModel,
  IssueTimelineActivityModel,
  IssueTimelineCommentModel,
  IssueTimelineItemModel,
  IssueUserModel,
} from "@/features/issue/types/issue-model";
import { getPlainTextFromRichText } from "@/lib/rich-text";

export async function createIssue(request: CreateIssueRequestDto) {
  return createIssueApi(request as Parameters<typeof createIssueApi>[0]);
}

export async function fetchIssueDetail(issueId: string): Promise<IssueDetailModel> {
  const response = await getIssueApi(issueId);
  return toIssueDetailModel(response as IssueDetailResponseDto);
}

export async function updateIssue(issueId: string, request: UpdateIssueRequestDto): Promise<IssueDetailModel> {
  const response = await updateIssueApi(
    issueId,
    request as Parameters<typeof updateIssueApi>[1],
  );
  return toIssueDetailModel(response as IssueDetailResponseDto);
}

export async function syncIssueAssignees(
  issueId: string,
  request: SyncIssueAssigneesRequestDto,
): Promise<SyncIssueAssigneesResponseDto> {
  return syncIssueAssigneesApi(issueId, request);
}

export async function syncIssueChanges(
  issueId: string,
  request: SyncIssueChangesRequestDto,
): Promise<SyncIssueChangesResponseDto> {
  return syncIssueChangesApi(issueId, request);
}

export async function syncIssueLabels(
  issueId: string,
  request: SyncIssueLabelsRequestDto,
): Promise<SyncIssueLabelsResponseDto> {
  return syncIssueLabelsApi(issueId, request);
}

export async function syncIssueParts(
  issueId: string,
  request: SyncIssuePartsRequestDto,
): Promise<SyncIssuePartsResponseDto> {
  return syncIssuePartsApi(issueId, request);
}

export async function closeIssue(issueId: string): Promise<IssueDetailModel> {
  const response = await closeIssueApi(issueId);
  return toIssueDetailModel(response as IssueDetailResponseDto);
}

export async function reopenIssue(issueId: string): Promise<IssueDetailModel> {
  const response = await reopenIssueApi(issueId);
  return toIssueDetailModel(response as IssueDetailResponseDto);
}

export async function fetchIssueTimeline(issueId: string): Promise<IssueTimelineItemModel[]> {
  const response = await getIssueTimelineApi(issueId);
  const timeline = response as IssueTimelineResponseDto;
  const items = timeline.items ?? [];

  return items.map((item) => {
    if (isIssueTimelineCommentItem(item)) {
      return toIssueTimelineCommentModel(item);
    }

    if (isIssueTimelineActivityItem(item)) {
      return toIssueTimelineActivityModel(item);
    }

    throw new Error(`알 수 없는 타임라인 아이템 타입입니다: ${String(item.type)}`);
  });
}

export async function createIssueComment(
  issueId: string,
  request: CreateIssueCommentRequestDto,
): Promise<IssueTimelineCommentModel> {
  const response = await createIssueCommentApi(
    issueId,
    request as Parameters<typeof createIssueCommentApi>[1],
  );
  return toIssueCommentModel(response as CreateIssueCommentResponseDto);
}

export async function updateIssueComment(
  issueId: string,
  commentId: string,
  request: UpdateIssueCommentRequestDto,
): Promise<IssueTimelineCommentModel> {
  const response = await updateIssueCommentApi(
    issueId,
    commentId,
    request as Parameters<typeof updateIssueCommentApi>[2],
  );
  return toIssueCommentModel(response as UpdateIssueCommentResponseDto);
}

export async function deleteIssueComment(issueId: string, commentId: string) {
  await deleteIssueCommentApi(issueId, commentId);
}

export async function addIssueFiles(
  issueId: string,
  request: AddIssueFilesRequestDto,
): Promise<IssueFileModel[]> {
  const response = await addIssueFilesApi(issueId, request);
  return response.map(toIssueFileModel);
}

export async function deleteIssueFile(issueId: string, fileId: string) {
  await deleteIssueFileApi(issueId, fileId);
}

function toIssueDetailModel(issue: IssueDetailResponseDto): IssueDetailModel {
  return {
    id: issue.id ?? "",
    number: issue.number ?? 0,
    title: issue.title ?? "",
    body: isObjectLike(issue.body) ? issue.body : null,
    bodyText: getPlainTextFromRichText(issue.body),
    state: issue.state ?? "OPEN",
    closedAt: issue.closed_at ?? null,
    createdAt: issue.created_at ?? "",
    updatedAt: issue.updated_at ?? "",
    isModified: issue.is_modified ?? false,
    createdBy: issue.created_by ? toIssueUserModel(issue.created_by) : null,
    labels: (issue.labels ?? []).map(toIssueLabelModel),
    assignees: (issue.assignees ?? []).map(toIssueUserModel),
    parts: (issue.parts ?? []).map(toIssuePartModel),
    files: (issue.files ?? []).map(toIssueFileModel),
    commentsCount: issue.comments_count ?? 0,
    linkedChanges: (issue.linked_engineering_changes ?? []).map(toIssueLinkedChangeModel),
  };
}

function toIssueUserModel(user: NonNullable<IssueDetailResponseDto["created_by"]>): IssueUserModel {
  return {
    userId: user.user_id ?? "",
    fullName: user.full_name ?? "알 수 없는 사용자",
    email: user.email ?? "",
    phone: user.phone ?? null,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toIssueLabelModel(label: NonNullable<NonNullable<IssueDetailResponseDto["labels"]>[number]>): IssueLabelModel {
  return {
    id: label.id ?? "",
    name: label.name ?? "",
    color: label.color ?? "",
  };
}

function toIssuePartModel(part: NonNullable<NonNullable<IssueDetailResponseDto["parts"]>[number]>): IssuePartModel {
  return {
    id: part.id ?? "",
    partNumber: part.part_number ?? "",
    name: part.name ?? null,
  };
}

function toIssueFileModel(file: NonNullable<NonNullable<IssueDetailResponseDto["files"]>[number]>): IssueFileModel {
  return {
    fileId: file.file_id ?? "",
    originalName: file.original_name ?? "",
    contentType: file.content_type ?? "",
    fileSize: file.file_size ?? 0,
    fileUrl: file.file_url ?? null,
    createdAt: file.created_at ?? "",
  };
}

function toIssueLinkedChangeModel(
  change: NonNullable<NonNullable<IssueDetailResponseDto["linked_engineering_changes"]>[number]>,
): IssueLinkedChangeModel {
  return {
    id: change.id ?? "",
    number: change.number ?? 0,
    title: change.title ?? "",
    state: change.state ?? "",
  };
}

function toIssueCommentModel(
  comment: CreateIssueCommentResponseDto | UpdateIssueCommentResponseDto,
): IssueTimelineCommentModel {
  return {
    type: "comment",
    id: comment.id ?? "",
    targetId: comment.target_id ?? null,
    body: isObjectLike(comment.body) ? comment.body : null,
    bodyText: getPlainTextFromRichText(comment.body),
    authorId: comment.created_by?.user_id ?? null,
    author: comment.created_by ? toIssueUserModel(comment.created_by) : null,
    createdAt: comment.created_at ?? "",
    updatedAt: comment.updated_at ?? "",
    isModified: comment.is_modified ?? false,
  };
}

function toIssueTimelineCommentModel(
  item: NonNullable<NonNullable<IssueTimelineResponseDto["items"]>[number]> & { type: "comment" },
): IssueTimelineCommentModel {
  return {
    type: "comment",
    id: item.id ?? "",
    targetId: null,
    body: isObjectLike(item.body) ? item.body : null,
    bodyText: getPlainTextFromRichText(item.body),
    authorId: item.author?.user_id ?? null,
    author: item.author ? toIssueUserModel(item.author) : null,
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? "",
    isModified: item.is_modified ?? false,
  };
}

function toIssueTimelineActivityModel(
  item: NonNullable<NonNullable<IssueTimelineResponseDto["items"]>[number]> & { type: "activity" },
): IssueTimelineActivityModel {
  return {
    type: "activity",
    id: item.id ?? "",
    action: item.action ?? "",
    scope: item.scope ?? null,
    actorId: item.actor?.user_id ?? null,
    actor: item.actor ? toIssueUserModel(item.actor) : null,
    detail: isObjectLike(item.detail) ? item.detail : null,
    createdAt: item.created_at ?? "",
  };
}

function isIssueTimelineCommentItem(
  item: NonNullable<NonNullable<IssueTimelineResponseDto["items"]>[number]>,
): item is NonNullable<NonNullable<IssueTimelineResponseDto["items"]>[number]> & { type: "comment" } {
  return item.type === "comment";
}

function isIssueTimelineActivityItem(
  item: NonNullable<NonNullable<IssueTimelineResponseDto["items"]>[number]>,
): item is NonNullable<NonNullable<IssueTimelineResponseDto["items"]>[number]> & { type: "activity" } {
  return item.type === "activity";
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
