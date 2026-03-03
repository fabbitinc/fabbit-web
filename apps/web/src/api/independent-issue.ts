import { apiClient } from "./client";
import type {
  CommentDto,
  CreateIssueRequest,
  UpdateIssueRequest,
  IssueDto,
  IssueFileDto,
  IssueLabelDto,
  IssueListResponse,
  IssuePartDto,
  IssueTimelineItemDto,
  IssueTimelineResponse,
  LinkedChangeBadgeDto,
  TimelineUserDto,
  UserSummaryDto,
} from "./types";

// 내부 API 응답 타입

interface ApiIssueLabelResponse {
  id?: string;
  name?: string;
  color?: string;
}

interface ApiIssueAssigneeResponse {
  user_id: string;
  full_name: string;
  profile_image_url?: string | null;
}

interface ApiIssuePartResponse {
  id: string;
  part_number: string;
  name?: string | null;
}

interface ApiIssueFileResponse {
  file_id: string;
  original_name: string;
  content_type: string;
  file_size: number;
  file_url?: string | null;
  created_at: string;
}

interface ApiLinkedChangeBadgeResponse {
  id: string;
  number: number;
  title: string;
  state: string;
  cr_state?: string;
}

interface ApiIssueResponse {
  id: string;
  project_id?: string | null;
  number: number;
  type: string;
  title: string;
  body?: Record<string, unknown> | string | null;
  state: string;
  closed_at?: string | null;
  created_at: string;
  updated_at?: string;
  created_by?: ApiIssueAssigneeResponse | null;
  labels?: ApiIssueLabelResponse[];
  assignees?: ApiIssueAssigneeResponse[];
  parts?: ApiIssuePartResponse[];
  files?: ApiIssueFileResponse[];
  comments_count?: number;
  linked_changes?: ApiLinkedChangeBadgeResponse[];
  is_modified?: boolean;
}

interface ApiIssueListEnvelope {
  open_count?: number;
  closed_count?: number;
  total?: number;
  offset?: number;
  limit?: number;
  items: ApiIssueResponse[];
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

function mapIssueLabel(label: ApiIssueLabelResponse): IssueLabelDto | null {
  if (!label.id || !label.name || !label.color) return null;
  return { id: label.id, name: label.name, color: label.color };
}

function mapUserSummary(user: ApiIssueAssigneeResponse): UserSummaryDto | null {
  if (!user.user_id || !user.full_name) return null;
  return {
    id: user.user_id,
    fullName: user.full_name,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function mapIssuePart(part: ApiIssuePartResponse): IssuePartDto {
  return { id: part.id, partNumber: part.part_number, name: part.name ?? null };
}

function mapIssueFile(file: ApiIssueFileResponse): IssueFileDto {
  return {
    fileId: file.file_id,
    originalName: file.original_name,
    contentType: file.content_type,
    fileSize: file.file_size,
    fileUrl: file.file_url ?? null,
    createdAt: file.created_at,
  };
}

function mapLinkedChange(item: ApiLinkedChangeBadgeResponse): LinkedChangeBadgeDto {
  return {
    id: item.id,
    number: item.number,
    title: item.title,
    state: item.state,
    crState: item.cr_state,
  };
}

function mapIssue(item: ApiIssueResponse): IssueDto {
  return {
    id: item.id,
    projectId: item.project_id ?? null,
    number: item.number,
    type: item.type,
    title: item.title,
    body: item.body ?? null,
    state: item.state,
    closedAt: item.closed_at ?? null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    isModified: item.is_modified ?? false,
    createdBy: item.created_by ? mapUserSummary(item.created_by) : null,
    labels: (item.labels ?? []).map(mapIssueLabel).filter((label): label is IssueLabelDto => label !== null),
    assignees: (item.assignees ?? []).map(mapUserSummary).filter((a): a is UserSummaryDto => a !== null),
    parts: (item.parts ?? []).map(mapIssuePart),
    files: (item.files ?? []).map(mapIssueFile),
    commentsCount: item.comments_count ?? 0,
    linkedChanges: (item.linked_changes ?? []).map(mapLinkedChange),
  };
}

function normalizeIssueListResponse(payload: unknown): ApiIssueListEnvelope {
  if (Array.isArray(payload)) {
    return { items: payload as ApiIssueResponse[] };
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as ApiIssueListEnvelope).items)) {
    return payload as ApiIssueListEnvelope;
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
// 독립 이슈 API 함수 (프로젝트 종속 아님)
// ============================================================

/** 독립 이슈 목록 조회 */
export async function getIssues(): Promise<IssueListResponse> {
  const response = await apiClient.get<unknown>("/api/v1/issues");
  const normalized = normalizeIssueListResponse(response.data);
  return {
    openCount: normalized.open_count ?? 0,
    closedCount: normalized.closed_count ?? 0,
    total: normalized.total ?? normalized.items.length,
    offset: normalized.offset ?? 0,
    limit: normalized.limit ?? normalized.items.length,
    items: normalized.items.map(mapIssue),
  };
}

/** 독립 이슈 상세 조회 */
export async function getIssue(issueNumber: string): Promise<IssueDto> {
  const response = await apiClient.get<ApiIssueResponse>(`/api/v1/issues/${issueNumber}`);
  return mapIssue(response.data);
}

/** 독립 이슈 생성 */
export async function createIssue(request: CreateIssueRequest): Promise<IssueDto> {
  const response = await apiClient.post<ApiIssueResponse>("/api/v1/issues", request);
  return mapIssue(response.data);
}

/** 독립 이슈 수정 */
export async function updateIssue(issueNumber: string, request: UpdateIssueRequest): Promise<IssueDto> {
  const response = await apiClient.patch<ApiIssueResponse>(`/api/v1/issues/${issueNumber}`, request);
  return mapIssue(response.data);
}

/** 독립 이슈 타임라인 조회 */
export async function getIssueTimeline(issueNumber: string): Promise<IssueTimelineResponse> {
  const response = await apiClient.get<ApiTimelineResponse>(`/api/v1/issues/${issueNumber}/timeline`);
  return {
    items: response.data.items.map(mapTimelineItem),
    users: mapTimelineUsers(response.data.users),
  };
}

/** 독립 이슈 담당자 동기화 */
export async function syncIssueAssignees(issueNumber: string, userIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/issues/${issueNumber}/assignees`, { user_ids: userIds });
}

/** 독립 이슈 변경 요청 동기화 */
export async function syncIssueChanges(issueNumber: string, crIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/issues/${issueNumber}/changes`, { cr_ids: crIds });
}

/** 독립 이슈 라벨 동기화 */
export async function syncIssueLabels(issueNumber: string, labelIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/issues/${issueNumber}/labels`, { label_ids: labelIds });
}

/** 독립 이슈 부품 동기화 */
export async function syncIssueParts(issueNumber: string, partIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/issues/${issueNumber}/parts`, { part_ids: partIds });
}

/** 독립 이슈에 파일 첨부 */
export async function attachIssueFiles(issueNumber: string, fileIds: string[]): Promise<void> {
  await apiClient.post(`/api/v1/issues/${issueNumber}/files`, { file_ids: fileIds });
}

/** 독립 이슈에서 파일 삭제 */
export async function deleteIssueFile(issueNumber: string, fileId: string): Promise<void> {
  await apiClient.delete(`/api/v1/issues/${issueNumber}/files/${fileId}`);
}

/** 독립 이슈 댓글 생성 */
export async function createIssueComment(
  issueNumber: string,
  body: Record<string, unknown>,
): Promise<CommentDto> {
  const response = await apiClient.post<ApiCommentResponse>(
    `/api/v1/issues/${issueNumber}/comments`,
    { body },
  );
  return mapComment(response.data);
}

/** 독립 이슈 댓글 수정 */
export async function updateIssueComment(
  issueNumber: string,
  commentId: string,
  body: Record<string, unknown>,
): Promise<CommentDto> {
  const response = await apiClient.patch<ApiCommentResponse>(
    `/api/v1/issues/${issueNumber}/comments/${commentId}`,
    { body },
  );
  return mapComment(response.data);
}

/** 독립 이슈 댓글 삭제 */
export async function deleteIssueComment(issueNumber: string, commentId: string): Promise<void> {
  await apiClient.delete(`/api/v1/issues/${issueNumber}/comments/${commentId}`);
}

/** 독립 이슈 닫기 */
export async function closeIssue(issueNumber: string): Promise<IssueDto> {
  const response = await apiClient.post<ApiIssueResponse>(`/api/v1/issues/${issueNumber}/close`);
  return mapIssue(response.data);
}

/** 독립 이슈 다시 열기 */
export async function reopenIssue(issueNumber: string): Promise<IssueDto> {
  const response = await apiClient.post<ApiIssueResponse>(`/api/v1/issues/${issueNumber}/reopen`);
  return mapIssue(response.data);
}
