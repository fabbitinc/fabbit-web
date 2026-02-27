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
} from "./types";

interface ApiIssueLabelResponse {
  id?: string;
  name?: string;
  color?: string;
}

interface ApiIssueAssigneeResponse {
  id: string;
  full_name: string;
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

interface ApiTimelineResponse {
  items: (ApiTimelineCommentItem | ApiTimelineActivityItem)[];
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
export async function getProjectIssue(projectId: string, issueId: string): Promise<IssueDto> {
  const response = await apiClient.get<ApiIssueResponse>(`/api/v1/projects/${projectId}/issues/${issueId}`);
  return mapIssue(response.data);
}

/** 이슈 타임라인 조회 */
export async function getIssueTimeline(projectId: string, issueId: string): Promise<IssueTimelineResponse> {
  const response = await apiClient.get<ApiTimelineResponse>(`/api/v1/projects/${projectId}/issues/${issueId}/timeline`);
  return {
    items: response.data.items.map(mapTimelineItem),
  };
}

/** 이슈 담당자 추가 */
export async function assignIssueUsers(projectId: string, issueId: string, userIds: string[]): Promise<void> {
  await apiClient.post(`/api/v1/projects/${projectId}/issues/${issueId}/assignees`, {
    user_ids: userIds,
  } satisfies AssignUsersRequest);
}

/** 이슈 담당자 제거 */
export async function unassignIssueUsers(projectId: string, issueId: string, userIds: string[]): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${projectId}/issues/${issueId}/assignees`, {
    data: {
      user_ids: userIds,
    } satisfies AssignUsersRequest,
  });
}

/** 프로젝트 라벨 목록 조회 */
export async function getProjectLabels(projectId: string): Promise<IssueLabelDto[]> {
  const response = await apiClient.get<ApiLabelListResponse>(`/api/v1/projects/${projectId}/labels`);
  return (response.data.items ?? []).map(mapIssueLabel).filter((label): label is IssueLabelDto => label !== null);
}

/** 이슈 라벨 동기화 (선택된 라벨 ID 목록을 그대로 전달) */
export async function syncIssueLabels(projectId: string, issueId: string, labelIds: string[]): Promise<void> {
  await apiClient.put(`/api/v1/projects/${projectId}/issues/${issueId}/labels`, {
    label_ids: labelIds,
  });
}

/** 프로젝트 이슈 생성 */
export async function createProjectIssue(projectId: string, request: CreateIssueRequest): Promise<IssueDto> {
  const response = await apiClient.post<ApiIssueResponse>(`/api/v1/projects/${projectId}/issues`, request);
  return mapIssue(response.data);
}

/** 이슈 댓글 생성 */
export async function createIssueComment(
  projectId: string,
  issueId: string,
  body: Record<string, unknown>,
): Promise<CommentDto> {
  const response = await apiClient.post<ApiCommentResponse>(
    `/api/v1/projects/${projectId}/issues/${issueId}/comments`,
    { body },
  );
  return mapComment(response.data);
}

/** 이슈 댓글 수정 */
export async function updateIssueComment(
  projectId: string,
  issueId: string,
  commentId: string,
  body: Record<string, unknown>,
): Promise<CommentDto> {
  const response = await apiClient.patch<ApiCommentResponse>(
    `/api/v1/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
    { body },
  );
  return mapComment(response.data);
}

/** 이슈 댓글 삭제 */
export async function deleteIssueComment(projectId: string, issueId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${projectId}/issues/${issueId}/comments/${commentId}`);
}
