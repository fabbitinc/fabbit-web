import {
  addFiles1 as addFilesApiV1EngineeringChangesEngineeringChangeNumberFilesPost,
  close as closeEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberClosePost,
  createComment1 as createCommentApiV1EngineeringChangesEngineeringChangeNumberCommentsPost,
  createEngineeringChange as createEngineeringChangeApiV1EngineeringChangesPost,
  deleteComment1 as deleteCommentApiV1EngineeringChangesEngineeringChangeNumberCommentsCommentIdDelete,
  deleteFile1 as deleteFileApiV1EngineeringChangesEngineeringChangeNumberFilesFileIdDelete,
  getEngineeringChange as getEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberGet,
  getTimeline1 as getTimelineApiV1EngineeringChangesEngineeringChangeNumberTimelineGet,
  merge as mergeEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberMergePost,
  reopen as reopenEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberReopenPost,
  submit as submitEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberSubmitPost,
  syncIssues as syncIssuesApiV1EngineeringChangesEngineeringChangeNumberIssuesPut,
  syncReviewers as syncReviewersApiV1EngineeringChangesEngineeringChangeNumberReviewersPut,
  updateComment1 as updateCommentApiV1EngineeringChangesEngineeringChangeNumberCommentsCommentIdPatch,
  updateEngineeringChange as updateEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberPatch,
} from "@/api/generated/orval/engineering-changes/engineering-changes";
import type {
  AddEngineeringChangeFilesRequestDto,
  EngineeringChangeDetailResponseDto,
  EngineeringChangeTimelineResponseDto,
  CreateEngineeringChangeCommentRequestDto,
  CreateEngineeringChangeCommentResponseDto,
  CreateEngineeringChangeDto,
  SyncEngineeringChangeIssuesRequestDto,
  SyncEngineeringChangeIssuesResponseDto,
  SyncEngineeringChangeReviewersRequestDto,
  SyncEngineeringChangeReviewersResponseDto,
  UpdateEngineeringChangeCommentRequestDto,
  UpdateEngineeringChangeCommentResponseDto,
  UpdateEngineeringChangeDto,
} from "@/features/engineering-change/api/engineering-change.types";
import type {
  EngineeringChangeDetailModel,
  EngineeringChangeFileModel,
  EngineeringChangeLinkedIssueModel,
  EngineeringChangePartModel,
  EngineeringChangePartRevisionModel,
  EngineeringChangeReviewerModel,
  EngineeringChangeReviewerTeamModel,
  EngineeringChangeTimelineActivityModel,
  EngineeringChangeTimelineCommentModel,
  EngineeringChangeTimelineItemModel,
  EngineeringChangeUserModel,
} from "@/features/engineering-change/types/engineering-change-model";
import { getPlainTextFromRichText } from "@/lib/rich-text";

export async function createEngineeringChange(request: CreateEngineeringChangeDto) {
  return createEngineeringChangeApiV1EngineeringChangesPost(
    request as Parameters<typeof createEngineeringChangeApiV1EngineeringChangesPost>[0],
  );
}

export async function fetchEngineeringChangeDetail(changeNumber: number): Promise<EngineeringChangeDetailModel> {
  const response = await getEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberGet(changeNumber);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function updateEngineeringChange(
  changeNumber: number,
  request: UpdateEngineeringChangeDto,
): Promise<EngineeringChangeDetailModel> {
  const response = await updateEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberPatch(
    changeNumber,
    request as Parameters<typeof updateEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberPatch>[1],
  );
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function syncEngineeringChangeIssues(
  changeNumber: number,
  request: SyncEngineeringChangeIssuesRequestDto,
): Promise<SyncEngineeringChangeIssuesResponseDto> {
  return syncIssuesApiV1EngineeringChangesEngineeringChangeNumberIssuesPut(changeNumber, request);
}

export async function syncEngineeringChangeAssignees(_changeNumber: number, _request: { user_ids?: string[] }) {
  return;
}

export async function syncEngineeringChangeReviewers(
  changeNumber: number,
  request: SyncEngineeringChangeReviewersRequestDto,
): Promise<SyncEngineeringChangeReviewersResponseDto> {
  return syncReviewersApiV1EngineeringChangesEngineeringChangeNumberReviewersPut(changeNumber, request);
}

export async function syncEngineeringChangeLabels(_changeNumber: number, _request: { label_ids?: string[] }) {
  return;
}

export async function syncEngineeringChangeParts(_changeNumber: number, _request: { part_ids?: string[] }) {
  return;
}

export async function submitEngineeringChange(changeNumber: number): Promise<EngineeringChangeDetailModel> {
  const response = await submitEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberSubmitPost(changeNumber);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function mergeEngineeringChange(changeNumber: number): Promise<EngineeringChangeDetailModel> {
  const response = await mergeEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberMergePost(changeNumber);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function closeEngineeringChange(changeNumber: number): Promise<EngineeringChangeDetailModel> {
  const response = await closeEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberClosePost(changeNumber);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function reopenEngineeringChange(changeNumber: number): Promise<EngineeringChangeDetailModel> {
  const response = await reopenEngineeringChangeApiV1EngineeringChangesEngineeringChangeNumberReopenPost(changeNumber);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function fetchEngineeringChangeTimeline(changeNumber: number): Promise<EngineeringChangeTimelineItemModel[]> {
  const response = await getTimelineApiV1EngineeringChangesEngineeringChangeNumberTimelineGet(changeNumber);
  const timeline = response as EngineeringChangeTimelineResponseDto;
  const items = timeline.items ?? [];
  const users = timeline.users ?? {};

  return items.map((item) => {
    if (isEngineeringChangeTimelineCommentItem(item)) {
      return toEngineeringChangeTimelineCommentModel(item, users);
    }

    if (isEngineeringChangeTimelineActivityItem(item)) {
      return toEngineeringChangeTimelineActivityModel(item, users);
    }

    throw new Error(`알 수 없는 타임라인 아이템 타입입니다: ${String(item.type)}`);
  });
}

export async function createEngineeringChangeComment(
  changeNumber: number,
  request: CreateEngineeringChangeCommentRequestDto,
): Promise<EngineeringChangeTimelineCommentModel> {
  const response = await createCommentApiV1EngineeringChangesEngineeringChangeNumberCommentsPost(
    changeNumber,
    request as Parameters<typeof createCommentApiV1EngineeringChangesEngineeringChangeNumberCommentsPost>[1],
  );
  return toEngineeringChangeCommentModel(response as CreateEngineeringChangeCommentResponseDto);
}

export async function updateEngineeringChangeComment(
  changeNumber: number,
  commentId: string,
  request: UpdateEngineeringChangeCommentRequestDto,
): Promise<EngineeringChangeTimelineCommentModel> {
  const response = await updateCommentApiV1EngineeringChangesEngineeringChangeNumberCommentsCommentIdPatch(
    changeNumber,
    commentId,
    request as Parameters<typeof updateCommentApiV1EngineeringChangesEngineeringChangeNumberCommentsCommentIdPatch>[2],
  );
  return toEngineeringChangeCommentModel(response as UpdateEngineeringChangeCommentResponseDto);
}

export async function deleteEngineeringChangeComment(changeNumber: number, commentId: string) {
  await deleteCommentApiV1EngineeringChangesEngineeringChangeNumberCommentsCommentIdDelete(changeNumber, commentId);
}

export async function addEngineeringChangeFiles(
  changeNumber: number,
  request: AddEngineeringChangeFilesRequestDto,
): Promise<EngineeringChangeFileModel[]> {
  const response = await addFilesApiV1EngineeringChangesEngineeringChangeNumberFilesPost(changeNumber, request);
  return response.map(toEngineeringChangeFileModel);
}

export async function deleteEngineeringChangeFile(changeNumber: number, fileId: string) {
  await deleteFileApiV1EngineeringChangesEngineeringChangeNumberFilesFileIdDelete(changeNumber, fileId);
}

function toEngineeringChangeDetailModel(change: EngineeringChangeDetailResponseDto): EngineeringChangeDetailModel {
  const reviewers = (change.reviewers ?? []).map(toEngineeringChangeReviewerModel);
  const reviewerTeams = (change.reviewer_teams ?? []).map(toEngineeringChangeReviewerTeamModel);
  const partRevisions = (change.part_revisions ?? []).map(toEngineeringChangePartRevisionModel);

  return {
    id: change.id,
    number: change.number,
    title: change.title,
    body: isObjectLike(change.body) ? change.body : null,
    bodyText: getPlainTextFromRichText(change.body),
    state: change.state,
    engineeringChangeState: change.state,
    closedAt: change.closed_at ?? null,
    createdAt: change.created_at,
    updatedAt: change.updated_at,
    isModified: change.is_modified,
    createdBy: change.created_by ? toEngineeringChangeUserModel(change.created_by) : null,
    labels: [],
    assignees: [],
    reviewers,
    reviewerTeams,
    parts: partRevisions.map(toEngineeringChangePartModel),
    partRevisions,
    files: (change.files ?? []).map(toEngineeringChangeFileModel),
    commentsCount: change.comments_count ?? 0,
    linkedIssues: (change.linked_issues ?? []).map(toEngineeringChangeLinkedIssueModel),
    mergedAt: change.merged_at ?? null,
    mergedBy: change.merged_by ?? null,
  };
}

function toEngineeringChangeUserModel(user: {
  user_id?: string;
  full_name?: string;
  email?: string;
  phone?: string | null;
  profile_image_url?: string | null;
}): EngineeringChangeUserModel {
  return {
    userId: user.user_id ?? "",
    fullName: user.full_name ?? "알 수 없는 사용자",
    email: user.email ?? "",
    phone: user.phone ?? null,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toEngineeringChangeReviewerModel(reviewer: {
  user_id?: string;
  full_name?: string;
  email?: string;
  phone?: string | null;
  profile_image_url?: string | null;
  review_status?: string;
  reviewed_at?: string;
}): EngineeringChangeReviewerModel {
  return {
    ...toEngineeringChangeUserModel(reviewer),
    reviewStatus: reviewer.review_status ?? "PENDING",
    reviewedAt: reviewer.reviewed_at ?? null,
  };
}

function toEngineeringChangeReviewerTeamModel(team: { team_id?: string; name?: string }): EngineeringChangeReviewerTeamModel {
  return {
    teamId: team.team_id ?? "",
    name: team.name ?? "이름 없음",
  };
}

function toEngineeringChangePartRevisionModel(part: {
  revision_id?: string;
  part_id?: string;
  part_number?: string;
  base_revision_code?: string;
  draft_key?: string;
  name?: string;
  status?: string;
}): EngineeringChangePartRevisionModel {
  return {
    revisionId: part.revision_id ?? "",
    partId: part.part_id ?? "",
    partNumber: part.part_number ?? "",
    baseRevisionCode: part.base_revision_code ?? null,
    draftKey: part.draft_key ?? "",
    name: part.name ?? null,
    status: part.status ?? null,
  };
}

function toEngineeringChangePartModel(part: EngineeringChangePartRevisionModel): EngineeringChangePartModel {
  return {
    id: part.partId || part.revisionId || part.draftKey,
    partNumber: part.partNumber,
    name: part.name,
  };
}

function toEngineeringChangeFileModel(file: {
  file_id?: string;
  original_name?: string;
  content_type?: string;
  file_size?: number;
  file_url?: string | null;
  created_at?: string;
}): EngineeringChangeFileModel {
  return {
    fileId: file.file_id ?? "",
    originalName: file.original_name ?? "",
    contentType: file.content_type ?? "",
    fileSize: file.file_size ?? 0,
    fileUrl: file.file_url ?? null,
    createdAt: file.created_at ?? "",
  };
}

function toEngineeringChangeLinkedIssueModel(issue: {
  id?: string;
  number?: number;
  title?: string;
  state?: string;
}): EngineeringChangeLinkedIssueModel {
  return {
    id: issue.id ?? "",
    number: issue.number ?? 0,
    title: issue.title ?? "",
    state: issue.state ?? "",
  };
}

function toEngineeringChangeCommentModel(
  comment: CreateEngineeringChangeCommentResponseDto | UpdateEngineeringChangeCommentResponseDto,
): EngineeringChangeTimelineCommentModel {
  return {
    type: "comment",
    id: comment.id ?? "",
    targetId: comment.target_id ?? null,
    body: isObjectLike(comment.body) ? comment.body : null,
    bodyText: getPlainTextFromRichText(comment.body),
    authorId: comment.created_by ?? null,
    author: null,
    createdAt: comment.created_at ?? "",
    updatedAt: comment.updated_at ?? "",
    isModified: comment.is_modified ?? false,
  };
}

function toEngineeringChangeTimelineCommentModel(
  item: NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number] & { type: "comment" },
  users: NonNullable<EngineeringChangeTimelineResponseDto["users"]>,
): EngineeringChangeTimelineCommentModel {
  return {
    type: "comment",
    id: item.id ?? "",
    targetId: item.id ?? null,
    body: isObjectLike(item.body) ? item.body : null,
    bodyText: getPlainTextFromRichText(item.body),
    authorId: item.author_id ?? null,
    author: item.author_id ? toEngineeringChangeTimelineUserModel(users[item.author_id]) : null,
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? "",
    isModified: item.is_modified ?? false,
  };
}

function toEngineeringChangeTimelineActivityModel(
  item: NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number] & { type: "activity" },
  users: NonNullable<EngineeringChangeTimelineResponseDto["users"]>,
): EngineeringChangeTimelineActivityModel {
  return {
    type: "activity",
    id: item.id ?? "",
    action: item.action ?? "",
    scope: item.scope ?? null,
    actorId: item.actor_id ?? null,
    actor: item.actor_id ? toEngineeringChangeTimelineUserModel(users[item.actor_id]) : null,
    detail: isObjectLike(item.detail) ? item.detail : null,
    createdAt: item.created_at ?? "",
  };
}

function toEngineeringChangeTimelineUserModel(
  user: NonNullable<EngineeringChangeTimelineResponseDto["users"]>[string] | undefined,
): EngineeringChangeUserModel | null {
  if (!user) {
    return null;
  }

  return toEngineeringChangeUserModel(user);
}

function isEngineeringChangeTimelineCommentItem(
  item: NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number],
): item is NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number] & { type: "comment" } {
  return item.type === "comment";
}

function isEngineeringChangeTimelineActivityItem(
  item: NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number],
): item is NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number] & { type: "activity" } {
  return item.type === "activity";
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
