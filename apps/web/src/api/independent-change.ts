import { apiClient } from "./client";
import type {
  ChangeDto,
  ChangeFileDto,
  ChangeLabelDto,
  ChangeListResponse,
  ChangePartDto,
  CreateChangeRequest,
  UpdateChangeRequest,
  IssueTimelineItemDto,
  IssueTimelineResponse,
  LinkedIssueBadgeDto,
  TimelineUserDto,
  UserSummaryDto,
  CommentDto,
} from "./types";

// 내부 API 응답 타입

interface ApiChangeLabelResponse {
  id?: string;
  name?: string;
  color?: string;
}

interface ApiChangeAssigneeResponse {
  user_id: string;
  full_name: string;
  profile_image_url?: string | null;
}

interface ApiChangePartResponse {
  id: string;
  part_number: string;
  name?: string | null;
}

interface ApiChangeFileResponse {
  file_id: string;
  original_name: string;
  content_type: string;
  file_size: number;
  file_url?: string | null;
  created_at: string;
}

interface ApiLinkedIssueBadgeResponse {
  id: string;
  number: number;
  title: string;
  state: string;
}

interface ApiChangeResponse {
  id: string;
  project_id?: string | null;
  number: number;
  type: string;
  title: string;
  body?: Record<string, unknown> | string | null;
  state: string;
  cr_state?: string;
  closed_at?: string | null;
  merged_at?: string | null;
  merged_by?: ApiChangeAssigneeResponse | null;
  created_at: string;
  updated_at?: string;
  created_by?: ApiChangeAssigneeResponse | null;
  labels?: ApiChangeLabelResponse[];
  assignees?: ApiChangeAssigneeResponse[];
  reviewers?: ApiChangeAssigneeResponse[];
  parts?: ApiChangePartResponse[];
  files?: ApiChangeFileResponse[];
  comments_count?: number;
  linked_issues?: ApiLinkedIssueBadgeResponse[];
  is_modified?: boolean;
}

interface ApiChangeListEnvelope {
  open_count?: number;
  closed_count?: number;
  total?: number;
  offset?: number;
  limit?: number;
  items: ApiChangeResponse[];
}

interface ApiCommentResponse {
  id: string;
  issue_id: string;
  body: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

interface ApiTimelineCommentItem {
  type: "comment";
  id: string;
  body: Record<string, unknown> | null;
  author_id: string | null;
  created_at: string;
  updated_at?: string;
  is_modified?: boolean;
}

interface ApiTimelineActivityItem {
  type: "activity";
  id: string;
  action: string;
  scope?: string | null;
  actor_id: string;
  detail: Record<string, unknown> | null;
  created_at: string;
}

interface ApiTimelineUserResponse {
  user_id: string;
  full_name: string;
  profile_image_url: string | null;
}

interface ApiTimelineResponse {
  items: (ApiTimelineCommentItem | ApiTimelineActivityItem)[];
  users?: Record<string, ApiTimelineUserResponse>;
}

// 매핑 함수

function mapChangeLabel(label: ApiChangeLabelResponse): ChangeLabelDto | null {
  if (!label.id || !label.name || !label.color) return null;
  return { id: label.id, name: label.name, color: label.color };
}

function mapUserSummary(user: ApiChangeAssigneeResponse): UserSummaryDto | null {
  if (!user.user_id || !user.full_name) return null;
  return {
    id: user.user_id,
    fullName: user.full_name,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function mapChangePart(part: ApiChangePartResponse): ChangePartDto {
  return { id: part.id, partNumber: part.part_number, name: part.name ?? null };
}

function mapChangeFile(file: ApiChangeFileResponse): ChangeFileDto {
  return {
    fileId: file.file_id,
    originalName: file.original_name,
    contentType: file.content_type,
    fileSize: file.file_size,
    fileUrl: file.file_url ?? null,
    createdAt: file.created_at,
  };
}

function mapLinkedIssue(item: ApiLinkedIssueBadgeResponse): LinkedIssueBadgeDto {
  return { id: item.id, number: item.number, title: item.title, state: item.state };
}

function mapChange(item: ApiChangeResponse): ChangeDto {
  return {
    id: item.id,
    projectId: item.project_id ?? null,
    number: item.number,
    type: item.type,
    title: item.title,
    body: item.body ?? null,
    state: item.state,
    crState: item.cr_state ?? item.state,
    closedAt: item.closed_at ?? null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    isModified: item.is_modified ?? false,
    createdBy: item.created_by ? mapUserSummary(item.created_by) : null,
    labels: (item.labels ?? []).map(mapChangeLabel).filter((l): l is ChangeLabelDto => l !== null),
    assignees: (item.assignees ?? []).map(mapUserSummary).filter((a): a is UserSummaryDto => a !== null),
    reviewers: (item.reviewers ?? []).map(mapUserSummary).filter((r): r is UserSummaryDto => r !== null),
    parts: (item.parts ?? []).map(mapChangePart),
    files: (item.files ?? []).map(mapChangeFile),
    commentsCount: item.comments_count ?? 0,
    linkedIssues: (item.linked_issues ?? []).map(mapLinkedIssue),
  };
}

function normalizeChangeListResponse(payload: unknown): ApiChangeListEnvelope {
  if (Array.isArray(payload)) {
    return { items: payload as ApiChangeResponse[] };
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as ApiChangeListEnvelope).items)) {
    return payload as ApiChangeListEnvelope;
  }
  return { items: [] };
}

function mapComment(item: ApiCommentResponse): CommentDto {
  return {
    id: item.id,
    issueId: item.issue_id,
    body: item.body,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by ?? null,
  };
}

function mapTimelineItem(item: ApiTimelineCommentItem | ApiTimelineActivityItem): IssueTimelineItemDto {
  if (item.type === "comment") {
    return {
      type: "comment",
      id: item.id,
      body: item.body,
      authorId: item.author_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      isModified: item.is_modified ?? false,
    };
  }
  return {
    type: "activity",
    id: item.id,
    action: item.action,
    scope: item.scope ?? null,
    actorId: item.actor_id,
    detail: item.detail,
    createdAt: item.created_at,
  };
}

function mapTimelineUsers(raw?: Record<string, ApiTimelineUserResponse>): Record<string, TimelineUserDto> {
  if (!raw) return {};
  const result: Record<string, TimelineUserDto> = {};
  for (const [key, u] of Object.entries(raw)) {
    result[key] = { id: u.user_id, fullName: u.full_name, profileImageUrl: u.profile_image_url };
  }
  return result;
}

// ============================================================
// 독립 변경 요청 API 함수 (프로젝트 종속 아님)
// ============================================================

/** 독립 변경 요청 목록 조회 */
export async function getChanges(): Promise<ChangeListResponse> {
  const response = await apiClient.get<unknown>("/api/v1/changes");
  const normalized = normalizeChangeListResponse(response.data);
  return {
    openCount: normalized.open_count ?? 0,
    closedCount: normalized.closed_count ?? 0,
    total: normalized.total ?? normalized.items.length,
    offset: normalized.offset ?? 0,
    limit: normalized.limit ?? normalized.items.length,
    items: normalized.items.map(mapChange),
  };
}

/** 독립 변경 요청 상세 조회 */
export async function getChange(changeNumber: string): Promise<ChangeDto> {
  const response = await apiClient.get<ApiChangeResponse>(`/api/v1/changes/${changeNumber}`);
  return mapChange(response.data);
}

/** 독립 변경 요청 생성 */
export async function createChange(request: CreateChangeRequest): Promise<ChangeDto> {
  const body: Record<string, unknown> = {
    title: request.title,
    body: request.body,
  };
  if (request.issueNumber != null) body.issue_number = request.issueNumber;
  if (request.assignee_user_ids?.length) body.assignee_user_ids = request.assignee_user_ids;
  if (request.reviewer_user_ids?.length) body.reviewer_user_ids = request.reviewer_user_ids;
  if (request.label_ids?.length) body.label_ids = request.label_ids;
  if (request.part_ids?.length) body.part_ids = request.part_ids;
  if (request.file_ids?.length) body.file_ids = request.file_ids;
  const response = await apiClient.post<ApiChangeResponse>("/api/v1/changes", body);
  return mapChange(response.data);
}

/** 독립 변경 요청 수정 */
export async function updateChange(changeNumber: string, request: UpdateChangeRequest): Promise<ChangeDto> {
  const response = await apiClient.patch<ApiChangeResponse>(`/api/v1/changes/${changeNumber}`, request);
  return mapChange(response.data);
}

/** 독립 변경 요청 타임라인 조회 */
export async function getChangeTimeline(changeNumber: string): Promise<IssueTimelineResponse> {
  const response = await apiClient.get<ApiTimelineResponse>(`/api/v1/changes/${changeNumber}/timeline`);
  return {
    items: response.data.items.map(mapTimelineItem),
    users: mapTimelineUsers(response.data.users),
  };
}

/** 독립 변경 요청 담당자 동기화 */
export async function syncChangeAssignees(changeNumber: string, userIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/changes/${changeNumber}/assignees`, { user_ids: userIds });
}

/** 독립 변경 요청 검토자 동기화 */
export async function syncChangeReviewers(changeNumber: string, userIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/changes/${changeNumber}/reviewers`, { user_ids: userIds });
}

/** 독립 변경 요청 라벨 동기화 */
export async function syncChangeLabels(changeNumber: string, labelIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/changes/${changeNumber}/labels`, { label_ids: labelIds });
}

/** 독립 변경 요청 부품 동기화 */
export async function syncChangeParts(changeNumber: string, partIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/changes/${changeNumber}/parts`, { part_ids: partIds });
}

/** 독립 변경 요청에 파일 첨부 */
export async function attachChangeFiles(changeNumber: string, fileIds: string[]): Promise<void> {
  await apiClient.post(`/api/v1/changes/${changeNumber}/files`, { file_ids: fileIds });
}

/** 독립 변경 요청에서 파일 삭제 */
export async function deleteChangeFile(changeNumber: string, fileId: string): Promise<void> {
  await apiClient.delete(`/api/v1/changes/${changeNumber}/files/${fileId}`);
}

/** 독립 변경 요청 댓글 생성 */
export async function createChangeComment(
  changeNumber: string,
  body: Record<string, unknown>,
): Promise<CommentDto> {
  const response = await apiClient.post<ApiCommentResponse>(
    `/api/v1/changes/${changeNumber}/comments`,
    { body },
  );
  return mapComment(response.data);
}

/** 독립 변경 요청 댓글 수정 */
export async function updateChangeComment(
  changeNumber: string,
  commentId: string,
  body: Record<string, unknown>,
): Promise<CommentDto> {
  const response = await apiClient.patch<ApiCommentResponse>(
    `/api/v1/changes/${changeNumber}/comments/${commentId}`,
    { body },
  );
  return mapComment(response.data);
}

/** 독립 변경 요청 댓글 삭제 */
export async function deleteChangeComment(changeNumber: string, commentId: string): Promise<void> {
  await apiClient.delete(`/api/v1/changes/${changeNumber}/comments/${commentId}`);
}

/** 독립 변경 요청 이슈 동기화 */
export async function syncChangeIssues(changeNumber: string, issueIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/changes/${changeNumber}/issues`, { issue_ids: issueIds });
}

/** 독립 변경 요청 닫기 */
export async function closeChange(changeNumber: string): Promise<ChangeDto> {
  const response = await apiClient.post<ApiChangeResponse>(`/api/v1/changes/${changeNumber}/close`);
  return mapChange(response.data);
}

/** 독립 변경 요청 반영 (merge) */
export async function mergeChange(changeNumber: string): Promise<ChangeDto> {
  const response = await apiClient.post<ApiChangeResponse>(`/api/v1/changes/${changeNumber}/merge`);
  return mapChange(response.data);
}

/** 독립 변경 요청 제출 (DRAFT → SUBMITTED) */
export async function submitChange(changeNumber: string): Promise<ChangeDto> {
  const response = await apiClient.post<ApiChangeResponse>(`/api/v1/changes/${changeNumber}/submit`);
  return mapChange(response.data);
}

/** 독립 변경 요청 다시 열기 */
export async function reopenChange(changeNumber: string): Promise<ChangeDto> {
  const response = await apiClient.post<ApiChangeResponse>(`/api/v1/changes/${changeNumber}/reopen`);
  return mapChange(response.data);
}
