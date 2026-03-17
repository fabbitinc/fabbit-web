import {
  addFiles as addFilesApiV1IssuesIssueNumberFilesPost,
  closeIssue as closeIssueApiV1IssuesIssueNumberClosePost,
  createComment as createCommentApiV1IssuesIssueNumberCommentsPost,
  createIssue as createIssueApiV1IssuesPost,
  deleteComment as deleteCommentApiV1IssuesIssueNumberCommentsCommentIdDelete,
  deleteFile as deleteFileApiV1IssuesIssueNumberFilesFileIdDelete,
  getIssue as getIssueApiV1IssuesIssueNumberGet,
  getTimeline as getTimelineApiV1IssuesIssueNumberTimelineGet,
  reopenIssue as reopenIssueApiV1IssuesIssueNumberReopenPost,
  syncAssignees as syncAssigneesApiV1IssuesIssueNumberAssigneesPut,
  syncLinkedEngineeringChanges as syncChangesApiV1IssuesIssueNumberEngineeringChangesPut,
  syncLabels as syncLabelsApiV1IssuesIssueNumberLabelsPut,
  syncParts as syncPartsApiV1IssuesIssueNumberPartsPut,
  updateComment as updateCommentApiV1IssuesIssueNumberCommentsCommentIdPatch,
  updateIssue as updateIssueApiV1IssuesIssueNumberPatch,
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
  return createIssueApiV1IssuesPost(request as Parameters<typeof createIssueApiV1IssuesPost>[0]);
}

export async function fetchIssueDetail(issueNumber: number): Promise<IssueDetailModel> {
  const response = await getIssueApiV1IssuesIssueNumberGet(issueNumber);
  return toIssueDetailModel(response as IssueDetailResponseDto);
}

export async function updateIssue(issueNumber: number, request: UpdateIssueRequestDto): Promise<IssueDetailModel> {
  const response = await updateIssueApiV1IssuesIssueNumberPatch(
    issueNumber,
    request as Parameters<typeof updateIssueApiV1IssuesIssueNumberPatch>[1],
  );
  return toIssueDetailModel(response as IssueDetailResponseDto);
}

export async function syncIssueAssignees(
  issueNumber: number,
  request: SyncIssueAssigneesRequestDto,
): Promise<SyncIssueAssigneesResponseDto> {
  return syncAssigneesApiV1IssuesIssueNumberAssigneesPut(issueNumber, request);
}

export async function syncIssueChanges(
  issueNumber: number,
  request: SyncIssueChangesRequestDto,
): Promise<SyncIssueChangesResponseDto> {
  return syncChangesApiV1IssuesIssueNumberEngineeringChangesPut(issueNumber, request);
}

export async function syncIssueLabels(
  issueNumber: number,
  request: SyncIssueLabelsRequestDto,
): Promise<SyncIssueLabelsResponseDto> {
  return syncLabelsApiV1IssuesIssueNumberLabelsPut(issueNumber, request);
}

export async function syncIssueParts(
  issueNumber: number,
  request: SyncIssuePartsRequestDto,
): Promise<SyncIssuePartsResponseDto> {
  return syncPartsApiV1IssuesIssueNumberPartsPut(issueNumber, request);
}

export async function closeIssue(issueNumber: number): Promise<IssueDetailModel> {
  const response = await closeIssueApiV1IssuesIssueNumberClosePost(issueNumber);
  return toIssueDetailModel(response as IssueDetailResponseDto);
}

export async function reopenIssue(issueNumber: number): Promise<IssueDetailModel> {
  const response = await reopenIssueApiV1IssuesIssueNumberReopenPost(issueNumber);
  return toIssueDetailModel(response as IssueDetailResponseDto);
}

export async function fetchIssueTimeline(issueNumber: number): Promise<IssueTimelineItemModel[]> {
  const response = await getTimelineApiV1IssuesIssueNumberTimelineGet(issueNumber);
  const timeline = response as IssueTimelineResponseDto;

  return timeline.items.map((item) => {
    if (isIssueTimelineCommentItem(item)) {
      return toIssueTimelineCommentModel(item, timeline.users);
    }

    if (isIssueTimelineActivityItem(item)) {
      return toIssueTimelineActivityModel(item, timeline.users);
    }

    throw new Error(`알 수 없는 타임라인 아이템 타입입니다: ${String(item.type)}`);
  });
}

export async function createIssueComment(
  issueNumber: number,
  request: CreateIssueCommentRequestDto,
): Promise<IssueTimelineCommentModel> {
  const response = await createCommentApiV1IssuesIssueNumberCommentsPost(
    issueNumber,
    request as Parameters<typeof createCommentApiV1IssuesIssueNumberCommentsPost>[1],
  );
  return toIssueCommentModel(response as CreateIssueCommentResponseDto);
}

export async function updateIssueComment(
  issueNumber: number,
  commentId: string,
  request: UpdateIssueCommentRequestDto,
): Promise<IssueTimelineCommentModel> {
  const response = await updateCommentApiV1IssuesIssueNumberCommentsCommentIdPatch(
    issueNumber,
    commentId,
    request as Parameters<typeof updateCommentApiV1IssuesIssueNumberCommentsCommentIdPatch>[2],
  );
  return toIssueCommentModel(response as UpdateIssueCommentResponseDto);
}

export async function deleteIssueComment(issueNumber: number, commentId: string) {
  await deleteCommentApiV1IssuesIssueNumberCommentsCommentIdDelete(issueNumber, commentId);
}

export async function addIssueFiles(
  issueNumber: number,
  request: AddIssueFilesRequestDto,
): Promise<IssueFileModel[]> {
  const response = await addFilesApiV1IssuesIssueNumberFilesPost(issueNumber, request);
  return response.map(toIssueFileModel);
}

export async function deleteIssueFile(issueNumber: number, fileId: string) {
  await deleteFileApiV1IssuesIssueNumberFilesFileIdDelete(issueNumber, fileId);
}

function toIssueDetailModel(issue: IssueDetailResponseDto): IssueDetailModel {
  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    body: isObjectLike(issue.body) ? issue.body : null,
    bodyText: getPlainTextFromRichText(issue.body),
    state: issue.state,
    closedAt: issue.closed_at ?? null,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    isModified: issue.is_modified,
    createdBy: issue.created_by ? toIssueUserModel(issue.created_by) : null,
    labels: issue.labels.map(toIssueLabelModel),
    assignees: issue.assignees.map(toIssueUserModel),
    parts: issue.parts.map(toIssuePartModel),
    files: issue.files.map(toIssueFileModel),
    commentsCount: issue.comments_count,
    linkedChanges: issue.linked_engineering_changes.map(toIssueLinkedChangeModel),
  };
}

function toIssueUserModel(user: IssueDetailResponseDto["assignees"][number]): IssueUserModel {
  return {
    userId: user.user_id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone ?? null,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toIssueLabelModel(label: IssueDetailResponseDto["labels"][number]): IssueLabelModel {
  return {
    id: label.id,
    name: label.name,
    color: label.color,
  };
}

function toIssuePartModel(part: IssueDetailResponseDto["parts"][number]): IssuePartModel {
  return {
    id: part.id,
    partNumber: part.part_number,
    name: part.name ?? null,
  };
}

function toIssueFileModel(file: IssueDetailResponseDto["files"][number]): IssueFileModel {
  return {
    fileId: file.file_id,
    originalName: file.original_name,
    contentType: file.content_type,
    fileSize: file.file_size,
    fileUrl: file.file_url ?? null,
    createdAt: file.created_at,
  };
}

function toIssueLinkedChangeModel(
  change: IssueDetailResponseDto["linked_engineering_changes"][number],
): IssueLinkedChangeModel {
  return {
    id: change.id,
    number: change.number,
    title: change.title,
    state: change.state,
  };
}

function toIssueCommentModel(
  comment: CreateIssueCommentResponseDto | UpdateIssueCommentResponseDto,
): IssueTimelineCommentModel {
  return {
    type: "comment",
    id: comment.id,
    body: isObjectLike(comment.body) ? comment.body : null,
    bodyText: getPlainTextFromRichText(comment.body),
    authorId: comment.created_by ?? null,
    author: null,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    isModified: comment.is_modified,
  };
}

function toIssueTimelineCommentModel(
  item: IssueTimelineResponseDto["items"][number] & { type: "comment" },
  users: IssueTimelineResponseDto["users"],
): IssueTimelineCommentModel {
  return {
    type: "comment",
    id: item.id,
    body: isObjectLike(item.body) ? item.body : null,
    bodyText: getPlainTextFromRichText(item.body),
    authorId: item.author_id ?? null,
    author: item.author_id ? toIssueTimelineUserModel(users[item.author_id]) : null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    isModified: item.is_modified,
  };
}

function toIssueTimelineActivityModel(
  item: IssueTimelineResponseDto["items"][number] & { type: "activity" },
  users: IssueTimelineResponseDto["users"],
): IssueTimelineActivityModel {
  return {
    type: "activity",
    id: item.id,
    action: item.action,
    scope: item.scope ?? null,
    actorId: item.actor_id,
    actor: toIssueTimelineUserModel(users[item.actor_id]),
    detail: isObjectLike(item.detail) ? item.detail : null,
    createdAt: item.created_at,
  };
}

function toIssueTimelineUserModel(user: IssueTimelineResponseDto["users"][string] | undefined): IssueUserModel | null {
  if (!user) {
    return null;
  }

  return {
    userId: user.user_id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone ?? null,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function isIssueTimelineCommentItem(
  item: IssueTimelineResponseDto["items"][number],
): item is IssueTimelineResponseDto["items"][number] & { type: "comment" } {
  return item.type === "comment";
}

function isIssueTimelineActivityItem(
  item: IssueTimelineResponseDto["items"][number],
): item is IssueTimelineResponseDto["items"][number] & { type: "activity" } {
  return item.type === "activity";
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
