import { apiClient } from "@/api/client";
import type {
  AddIssueFilesRequestDto,
  AddIssueFilesResponseDto,
  CreateIssueCommentRequestDto,
  CreateIssueCommentResponseDto,
  CreateIssueRequestDto,
  IssueDetailResponseDto,
  IssueResponseDto,
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
  const response = await apiClient.post<IssueResponseDto>("/api/v1/issues", request);
  return response.data;
}

export async function fetchIssueDetail(issueNumber: number): Promise<IssueDetailModel> {
  const response = await apiClient.get<IssueDetailResponseDto>(`/api/v1/issues/${issueNumber}`);
  return toIssueDetailModel(response.data);
}

export async function updateIssue(issueNumber: number, request: UpdateIssueRequestDto): Promise<IssueDetailModel> {
  const response = await apiClient.patch<IssueDetailResponseDto>(`/api/v1/issues/${issueNumber}`, request);
  return toIssueDetailModel(response.data);
}

export async function syncIssueAssignees(
  issueNumber: number,
  request: SyncIssueAssigneesRequestDto,
): Promise<SyncIssueAssigneesResponseDto> {
  const response = await apiClient.put<SyncIssueAssigneesResponseDto>(
    `/api/v1/issues/${issueNumber}/assignees`,
    request,
  );
  return response.data;
}

export async function syncIssueChanges(
  issueNumber: number,
  request: SyncIssueChangesRequestDto,
): Promise<SyncIssueChangesResponseDto> {
  const response = await apiClient.put<SyncIssueChangesResponseDto>(
    `/api/v1/issues/${issueNumber}/changes`,
    request,
  );
  return response.data;
}

export async function syncIssueLabels(
  issueNumber: number,
  request: SyncIssueLabelsRequestDto,
): Promise<SyncIssueLabelsResponseDto> {
  const response = await apiClient.put<SyncIssueLabelsResponseDto>(
    `/api/v1/issues/${issueNumber}/labels`,
    request,
  );
  return response.data;
}

export async function syncIssueParts(
  issueNumber: number,
  request: SyncIssuePartsRequestDto,
): Promise<SyncIssuePartsResponseDto> {
  const response = await apiClient.put<SyncIssuePartsResponseDto>(`/api/v1/issues/${issueNumber}/parts`, request);
  return response.data;
}

export async function closeIssue(issueNumber: number): Promise<IssueDetailModel> {
  const response = await apiClient.post<IssueDetailResponseDto>(`/api/v1/issues/${issueNumber}/close`);
  return toIssueDetailModel(response.data);
}

export async function reopenIssue(issueNumber: number): Promise<IssueDetailModel> {
  const response = await apiClient.post<IssueDetailResponseDto>(`/api/v1/issues/${issueNumber}/reopen`);
  return toIssueDetailModel(response.data);
}

export async function fetchIssueTimeline(issueNumber: number): Promise<IssueTimelineItemModel[]> {
  const response = await apiClient.get<IssueTimelineResponseDto>(`/api/v1/issues/${issueNumber}/timeline`);

  return response.data.items.map((item) =>
    item.type === "comment"
      ? toIssueTimelineCommentModel(item, response.data.users)
      : toIssueTimelineActivityModel(item, response.data.users),
  );
}

export async function createIssueComment(
  issueNumber: number,
  request: CreateIssueCommentRequestDto,
): Promise<IssueTimelineCommentModel> {
  const response = await apiClient.post<CreateIssueCommentResponseDto>(
    `/api/v1/issues/${issueNumber}/comments`,
    request,
  );
  return toIssueCommentModel(response.data);
}

export async function updateIssueComment(
  issueNumber: number,
  commentId: string,
  request: UpdateIssueCommentRequestDto,
): Promise<IssueTimelineCommentModel> {
  const response = await apiClient.patch<UpdateIssueCommentResponseDto>(
    `/api/v1/issues/${issueNumber}/comments/${commentId}`,
    request,
  );
  return toIssueCommentModel(response.data);
}

export async function deleteIssueComment(issueNumber: number, commentId: string) {
  await apiClient.delete(`/api/v1/issues/${issueNumber}/comments/${commentId}`);
}

export async function addIssueFiles(
  issueNumber: number,
  request: AddIssueFilesRequestDto,
): Promise<IssueFileModel[]> {
  const response = await apiClient.post<AddIssueFilesResponseDto>(`/api/v1/issues/${issueNumber}/files`, request);
  return response.data.map(toIssueFileModel);
}

export async function deleteIssueFile(issueNumber: number, fileId: string) {
  await apiClient.delete(`/api/v1/issues/${issueNumber}/files/${fileId}`);
}

function toIssueDetailModel(issue: IssueDetailResponseDto): IssueDetailModel {
  return {
    id: issue.id,
    number: issue.number,
    type: issue.type,
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
    linkedChanges: issue.linked_changes.map(toIssueLinkedChangeModel),
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
  change: IssueDetailResponseDto["linked_changes"][number],
): IssueLinkedChangeModel {
  return {
    id: change.id,
    number: change.number,
    title: change.title,
    state: change.state,
    crState: change.cr_state,
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

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
