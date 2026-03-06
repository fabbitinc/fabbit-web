import {
  addFilesApiV1ChangesIssueNumberFilesPost,
  closeCrApiV1ChangesIssueNumberClosePost,
  createChangeRequestApiV1ChangesPost,
  createCommentApiV1ChangesIssueNumberCommentsPost,
  deleteCommentApiV1ChangesIssueNumberCommentsCommentIdDelete,
  deleteFileApiV1ChangesIssueNumberFilesFileIdDelete,
  getChangeRequestApiV1ChangesIssueNumberGet,
  getTimelineApiV1ChangesIssueNumberTimelineGet,
  mergeCrApiV1ChangesIssueNumberMergePost,
  reopenCrApiV1ChangesIssueNumberReopenPost,
  submitCrApiV1ChangesIssueNumberSubmitPost,
  syncAssigneesApiV1ChangesIssueNumberAssigneesPut,
  syncIssuesApiV1ChangesIssueNumberIssuesPut,
  syncLabelsApiV1ChangesIssueNumberLabelsPut,
  syncPartsApiV1ChangesIssueNumberPartsPut,
  syncReviewersApiV1ChangesIssueNumberReviewersPut,
  updateChangeRequestApiV1ChangesIssueNumberPatch,
  updateCommentApiV1ChangesIssueNumberCommentsCommentIdPatch,
} from "@/api/generated/orval/changes/changes";
import type {
  AddChangeRequestFilesRequestDto,
  ChangeRequestDetailResponseDto,
  CreateChangeRequestCommentRequestDto,
  CreateChangeRequestCommentResponseDto,
  CreateChangeRequestDto,
  ChangeRequestTimelineResponseDto,
  SyncChangeRequestAssigneesRequestDto,
  SyncChangeRequestAssigneesResponseDto,
  SyncChangeRequestIssuesRequestDto,
  SyncChangeRequestIssuesResponseDto,
  SyncChangeRequestLabelsRequestDto,
  SyncChangeRequestLabelsResponseDto,
  SyncChangeRequestPartsRequestDto,
  SyncChangeRequestPartsResponseDto,
  SyncChangeRequestReviewersRequestDto,
  SyncChangeRequestReviewersResponseDto,
  UpdateChangeRequestCommentRequestDto,
  UpdateChangeRequestCommentResponseDto,
  UpdateChangeRequestDto,
} from "@/features/change-request/api/change-request.types";
import type {
  ChangeRequestDetailModel,
  ChangeRequestFileModel,
  ChangeRequestLabelModel,
  ChangeRequestLinkedIssueModel,
  ChangeRequestPartModel,
  ChangeRequestReviewerModel,
  ChangeRequestTimelineActivityModel,
  ChangeRequestTimelineCommentModel,
  ChangeRequestTimelineItemModel,
  ChangeRequestUserModel,
} from "@/features/change-request/types/change-request-model";
import { getPlainTextFromRichText } from "@/lib/rich-text";

export async function createChangeRequest(request: CreateChangeRequestDto) {
  return createChangeRequestApiV1ChangesPost(request);
}

export async function fetchChangeRequestDetail(changeNumber: number): Promise<ChangeRequestDetailModel> {
  const response = await getChangeRequestApiV1ChangesIssueNumberGet(changeNumber);
  return toChangeRequestDetailModel(response as ChangeRequestDetailResponseDto);
}

export async function updateChangeRequest(
  changeNumber: number,
  request: UpdateChangeRequestDto,
): Promise<ChangeRequestDetailModel> {
  const response = await updateChangeRequestApiV1ChangesIssueNumberPatch(changeNumber, request);
  return toChangeRequestDetailModel(response as ChangeRequestDetailResponseDto);
}

export async function syncChangeRequestIssues(
  changeNumber: number,
  request: SyncChangeRequestIssuesRequestDto,
): Promise<SyncChangeRequestIssuesResponseDto> {
  return syncIssuesApiV1ChangesIssueNumberIssuesPut(changeNumber, request);
}

export async function syncChangeRequestAssignees(
  changeNumber: number,
  request: SyncChangeRequestAssigneesRequestDto,
): Promise<SyncChangeRequestAssigneesResponseDto> {
  return syncAssigneesApiV1ChangesIssueNumberAssigneesPut(changeNumber, request);
}

export async function syncChangeRequestReviewers(
  changeNumber: number,
  request: SyncChangeRequestReviewersRequestDto,
): Promise<SyncChangeRequestReviewersResponseDto> {
  return syncReviewersApiV1ChangesIssueNumberReviewersPut(changeNumber, request);
}

export async function syncChangeRequestLabels(
  changeNumber: number,
  request: SyncChangeRequestLabelsRequestDto,
): Promise<SyncChangeRequestLabelsResponseDto> {
  return syncLabelsApiV1ChangesIssueNumberLabelsPut(changeNumber, request);
}

export async function syncChangeRequestParts(
  changeNumber: number,
  request: SyncChangeRequestPartsRequestDto,
): Promise<SyncChangeRequestPartsResponseDto> {
  return syncPartsApiV1ChangesIssueNumberPartsPut(changeNumber, request);
}

export async function submitChangeRequest(changeNumber: number): Promise<ChangeRequestDetailModel> {
  const response = await submitCrApiV1ChangesIssueNumberSubmitPost(changeNumber);
  return toChangeRequestDetailModel(response as ChangeRequestDetailResponseDto);
}

export async function mergeChangeRequest(changeNumber: number): Promise<ChangeRequestDetailModel> {
  const response = await mergeCrApiV1ChangesIssueNumberMergePost(changeNumber);
  return toChangeRequestDetailModel(response as ChangeRequestDetailResponseDto);
}

export async function closeChangeRequest(changeNumber: number): Promise<ChangeRequestDetailModel> {
  const response = await closeCrApiV1ChangesIssueNumberClosePost(changeNumber);
  return toChangeRequestDetailModel(response as ChangeRequestDetailResponseDto);
}

export async function reopenChangeRequest(changeNumber: number): Promise<ChangeRequestDetailModel> {
  const response = await reopenCrApiV1ChangesIssueNumberReopenPost(changeNumber);
  return toChangeRequestDetailModel(response as ChangeRequestDetailResponseDto);
}

export async function fetchChangeRequestTimeline(changeNumber: number): Promise<ChangeRequestTimelineItemModel[]> {
  const response = await getTimelineApiV1ChangesIssueNumberTimelineGet(changeNumber);
  const timeline = response as ChangeRequestTimelineResponseDto;

  return timeline.items.map((item) =>
    item.type === "comment"
      ? toChangeRequestTimelineCommentModel(item, timeline.users)
      : toChangeRequestTimelineActivityModel(item, timeline.users),
  );
}

export async function createChangeRequestComment(
  changeNumber: number,
  request: CreateChangeRequestCommentRequestDto,
): Promise<ChangeRequestTimelineCommentModel> {
  const response = await createCommentApiV1ChangesIssueNumberCommentsPost(changeNumber, request);
  return toChangeRequestCommentModel(response as CreateChangeRequestCommentResponseDto);
}

export async function updateChangeRequestComment(
  changeNumber: number,
  commentId: string,
  request: UpdateChangeRequestCommentRequestDto,
): Promise<ChangeRequestTimelineCommentModel> {
  const response = await updateCommentApiV1ChangesIssueNumberCommentsCommentIdPatch(changeNumber, commentId, request);
  return toChangeRequestCommentModel(response as UpdateChangeRequestCommentResponseDto);
}

export async function deleteChangeRequestComment(changeNumber: number, commentId: string) {
  await deleteCommentApiV1ChangesIssueNumberCommentsCommentIdDelete(changeNumber, commentId);
}

export async function addChangeRequestFiles(
  changeNumber: number,
  request: AddChangeRequestFilesRequestDto,
): Promise<ChangeRequestFileModel[]> {
  const response = await addFilesApiV1ChangesIssueNumberFilesPost(changeNumber, request);
  return response.map(toChangeRequestFileModel);
}

export async function deleteChangeRequestFile(changeNumber: number, fileId: string) {
  await deleteFileApiV1ChangesIssueNumberFilesFileIdDelete(changeNumber, fileId);
}

function toChangeRequestDetailModel(change: ChangeRequestDetailResponseDto): ChangeRequestDetailModel {
  return {
    id: change.id,
    number: change.number,
    type: change.type,
    title: change.title,
    body: isObjectLike(change.body) ? change.body : null,
    bodyText: getPlainTextFromRichText(change.body),
    state: change.state,
    crState: change.cr_state,
    closedAt: change.closed_at ?? null,
    createdAt: change.created_at,
    updatedAt: change.updated_at,
    isModified: change.is_modified,
    createdBy: change.created_by ? toChangeRequestUserModel(change.created_by) : null,
    labels: change.labels.map(toChangeRequestLabelModel),
    assignees: change.assignees.map(toChangeRequestUserModel),
    reviewers: change.reviewers.map(toChangeRequestReviewerModel),
    parts: change.parts.map(toChangeRequestPartModel),
    files: change.files.map(toChangeRequestFileModel),
    commentsCount: change.comments_count,
    linkedIssues: change.linked_issues.map(toChangeRequestLinkedIssueModel),
    mergedAt: change.merged_at ?? null,
    mergedBy: change.merged_by ?? null,
  };
}

function toChangeRequestUserModel(user: ChangeRequestDetailResponseDto["assignees"][number]): ChangeRequestUserModel {
  return {
    userId: user.user_id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone ?? null,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toChangeRequestReviewerModel(
  reviewer: ChangeRequestDetailResponseDto["reviewers"][number],
): ChangeRequestReviewerModel {
  return {
    userId: reviewer.user_id,
    fullName: reviewer.full_name,
    email: reviewer.email,
    phone: reviewer.phone ?? null,
    profileImageUrl: reviewer.profile_image_url ?? null,
    reviewStatus: reviewer.review_status,
    reviewedAt: reviewer.reviewed_at ?? null,
  };
}

function toChangeRequestLabelModel(
  label: ChangeRequestDetailResponseDto["labels"][number],
): ChangeRequestLabelModel {
  return {
    id: label.id,
    name: label.name,
    color: label.color,
  };
}

function toChangeRequestPartModel(part: ChangeRequestDetailResponseDto["parts"][number]): ChangeRequestPartModel {
  return {
    id: part.id,
    partNumber: part.part_number,
    name: part.name ?? null,
  };
}

function toChangeRequestFileModel(file: ChangeRequestDetailResponseDto["files"][number]): ChangeRequestFileModel {
  return {
    fileId: file.file_id,
    originalName: file.original_name,
    contentType: file.content_type,
    fileSize: file.file_size,
    fileUrl: file.file_url ?? null,
    createdAt: file.created_at,
  };
}

function toChangeRequestLinkedIssueModel(
  issue: ChangeRequestDetailResponseDto["linked_issues"][number],
): ChangeRequestLinkedIssueModel {
  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
  };
}

function toChangeRequestCommentModel(
  comment: CreateChangeRequestCommentResponseDto | UpdateChangeRequestCommentResponseDto,
): ChangeRequestTimelineCommentModel {
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

function toChangeRequestTimelineCommentModel(
  item: ChangeRequestTimelineResponseDto["items"][number] & { type: "comment" },
  users: ChangeRequestTimelineResponseDto["users"],
): ChangeRequestTimelineCommentModel {
  return {
    type: "comment",
    id: item.id,
    body: isObjectLike(item.body) ? item.body : null,
    bodyText: getPlainTextFromRichText(item.body),
    authorId: item.author_id ?? null,
    author: item.author_id ? toChangeRequestTimelineUserModel(users[item.author_id]) : null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    isModified: item.is_modified,
  };
}

function toChangeRequestTimelineActivityModel(
  item: ChangeRequestTimelineResponseDto["items"][number] & { type: "activity" },
  users: ChangeRequestTimelineResponseDto["users"],
): ChangeRequestTimelineActivityModel {
  return {
    type: "activity",
    id: item.id,
    action: item.action,
    scope: item.scope ?? null,
    actorId: item.actor_id,
    actor: toChangeRequestTimelineUserModel(users[item.actor_id]),
    detail: isObjectLike(item.detail) ? item.detail : null,
    createdAt: item.created_at,
  };
}

function toChangeRequestTimelineUserModel(
  user: ChangeRequestTimelineResponseDto["users"][string] | undefined,
): ChangeRequestUserModel | null {
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

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
