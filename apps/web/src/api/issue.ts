import { apiClient } from "./client";
import type {
  CommentDto,
  CreateIssueRequest,
  IssueAssigneeDto,
  IssueDto,
  IssueFileDto,
  IssueLabelDto,
  IssueListResponse,
  IssuePartDto,
  IssueTimelineItemDto,
  IssueTimelineResponse,
  TimelineUserDto,
} from "./types";

interface ApiIssueLabelResponse {
  id?: string;
  name?: string;
  color?: string;
}

interface ApiIssueAssigneeResponse {
  id: string;
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

interface ApiIssueResponse {
  id: string;
  project_id: string;
  number: number;
  type: string;
  title: string;
  body?: Record<string, unknown> | string | null;
  state: string;
  closed_at?: string | null;
  created_at: string;
  updated_at?: string;
  created_by?: string | null;
  created_by_name?: string | null;
  labels?: ApiIssueLabelResponse[];
  assignees?: ApiIssueAssigneeResponse[];
  parts?: ApiIssuePartResponse[];
  files?: ApiIssueFileResponse[];
  comments_count?: number;
}

interface ApiIssueListEnvelope {
  open_count?: number;
  closed_count?: number;
  total?: number;
  offset?: number;
  limit?: number;
  items: ApiIssueResponse[];
}

interface AssignUsersRequest {
  user_ids: string[];
}


interface ApiLabelListResponse {
  items?: ApiIssueLabelResponse[];
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
}

interface ApiTimelineActivityItem {
  type: "activity";
  id: string;
  action: string;
  actor_id: string;
  detail: Record<string, unknown> | null;
  created_at: string;
}

interface ApiTimelineUserResponse {
  id: string;
  full_name: string;
  profile_image_url: string | null;
}

interface ApiTimelineResponse {
  items: (ApiTimelineCommentItem | ApiTimelineActivityItem)[];
  users?: Record<string, ApiTimelineUserResponse>;
}

function mapIssueLabel(label: ApiIssueLabelResponse): IssueLabelDto | null {
  if (!label.id || !label.name || !label.color) return null;
  return {
    id: label.id,
    name: label.name,
    color: label.color,
  };
}

function mapIssueAssignee(assignee: ApiIssueAssigneeResponse): IssueAssigneeDto | null {
  if (!assignee.id || !assignee.full_name) return null;
  return {
    id: assignee.id,
    fullName: assignee.full_name,
    profileImageUrl: assignee.profile_image_url ?? null,
  };
}

function mapIssuePart(part: ApiIssuePartResponse): IssuePartDto {
  return {
    id: part.id,
    partNumber: part.part_number,
    name: part.name ?? null,
  };
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

function mapIssue(item: ApiIssueResponse): IssueDto {
  return {
    id: item.id,
    projectId: item.project_id,
    number: item.number,
    type: item.type,
    title: item.title,
    body: item.body ?? null,
    state: item.state,
    closedAt: item.closed_at ?? null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by ?? null,
    createdByName: item.created_by_name ?? null,
    labels: (item.labels ?? []).map(mapIssueLabel).filter((label): label is IssueLabelDto => label !== null),
    assignees: (item.assignees ?? [])
      .map(mapIssueAssignee)
      .filter((assignee): assignee is IssueAssigneeDto => assignee !== null),
    parts: (item.parts ?? []).map(mapIssuePart),
    files: (item.files ?? []).map(mapIssueFile),
    commentsCount: item.comments_count ?? 0,
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
    issueNumber: item.issue_id,
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
    };
  }

  return {
    type: "activity",
    id: item.id,
    action: item.action,
    actorId: item.actor_id,
    detail: item.detail,
    createdAt: item.created_at,
  };
}

/** 프로젝트 이슈 목록 조회 */
export async function getProjectIssues(projectId: string): Promise<IssueListResponse> {
  const response = await apiClient.get<unknown>(`/api/v1/projects/${projectId}/issues`);
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

/** 프로젝트 이슈 상세 조회 */
export async function getProjectIssue(projectId: string, issueNumber: string): Promise<IssueDto> {
  const response = await apiClient.get<ApiIssueResponse>(`/api/v1/projects/${projectId}/issues/${issueNumber}`);
  return mapIssue(response.data);
}

function mapTimelineUsers(raw?: Record<string, ApiTimelineUserResponse>): Record<string, TimelineUserDto> {
  if (!raw) return {};
  const result: Record<string, TimelineUserDto> = {};
  for (const [key, u] of Object.entries(raw)) {
    result[key] = { id: u.id, fullName: u.full_name, profileImageUrl: u.profile_image_url };
  }
  return result;
}

/** 이슈 타임라인 조회 */
export async function getIssueTimeline(projectId: string, issueNumber: string): Promise<IssueTimelineResponse> {
  const response = await apiClient.get<ApiTimelineResponse>(`/api/v1/projects/${projectId}/issues/${issueNumber}/timeline`);
  return {
    items: response.data.items.map(mapTimelineItem),
    users: mapTimelineUsers(response.data.users),
  };
}

/** 이슈 담당자 추가 */
export async function assignIssueUsers(projectId: string, issueNumber: string, userIds: string[]): Promise<void> {
  await apiClient.post(`/api/v1/projects/${projectId}/issues/${issueNumber}/assignees`, {
    user_ids: userIds,
  } satisfies AssignUsersRequest);
}

/** 이슈 담당자 제거 */
export async function unassignIssueUsers(projectId: string, issueNumber: string, userIds: string[]): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${projectId}/issues/${issueNumber}/assignees`, {
    data: {
      user_ids: userIds,
    } satisfies AssignUsersRequest,
  });
}

/** 이슈 담당자 동기화 (PUT) */
export async function syncIssueAssignees(projectId: string, issueNumber: string, userIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/projects/${projectId}/issues/${issueNumber}/assignees`, {
    user_ids: userIds,
  });
}

/** 이슈용 프로젝트 라벨 목록 조회 (IssueLabelDto[] 반환) */
export async function getIssueLabels(projectId: string): Promise<IssueLabelDto[]> {
  const response = await apiClient.get<ApiLabelListResponse>(`/api/v1/projects/${projectId}/labels`);
  return (response.data.items ?? []).map(mapIssueLabel).filter((label): label is IssueLabelDto => label !== null);
}

/** 이슈 라벨 동기화 (선택된 라벨 ID 목록을 그대로 전달) */
export async function syncIssueLabels(projectId: string, issueNumber: string, labelIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/projects/${projectId}/issues/${issueNumber}/labels`, {
    label_ids: labelIds,
  });
}

/** 이슈 부품 동기화 (PUT) */
export async function syncIssueParts(projectId: string, issueNumber: string, partIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/projects/${projectId}/issues/${issueNumber}/parts`, {
    part_ids: partIds,
  });
}

/** 이슈에 파일 첨부 */
export async function attachIssueFiles(projectId: string, issueNumber: string, fileIds: string[]): Promise<void> {
  await apiClient.post(`/api/v1/projects/${projectId}/issues/${issueNumber}/files`, {
    file_ids: fileIds,
  });
}

/** 이슈에서 파일 삭제 */
export async function deleteIssueFile(projectId: string, issueNumber: string, fileId: string): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${projectId}/issues/${issueNumber}/files/${fileId}`);
}

/** 프로젝트 이슈 생성 */
export async function createProjectIssue(projectId: string, request: CreateIssueRequest): Promise<IssueDto> {
  const response = await apiClient.post<ApiIssueResponse>(`/api/v1/projects/${projectId}/issues`, request);
  return mapIssue(response.data);
}

/** 이슈 댓글 생성 */
export async function createIssueComment(
  projectId: string,
  issueNumber: string,
  body: Record<string, unknown>,
): Promise<CommentDto> {
  const response = await apiClient.post<ApiCommentResponse>(
    `/api/v1/projects/${projectId}/issues/${issueNumber}/comments`,
    { body },
  );
  return mapComment(response.data);
}

/** 이슈 댓글 수정 */
export async function updateIssueComment(
  projectId: string,
  issueNumber: string,
  commentId: string,
  body: Record<string, unknown>,
): Promise<CommentDto> {
  const response = await apiClient.patch<ApiCommentResponse>(
    `/api/v1/projects/${projectId}/issues/${issueNumber}/comments/${commentId}`,
    { body },
  );
  return mapComment(response.data);
}

/** 이슈 댓글 삭제 */
export async function deleteIssueComment(projectId: string, issueNumber: string, commentId: string): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${projectId}/issues/${issueNumber}/comments/${commentId}`);
}
