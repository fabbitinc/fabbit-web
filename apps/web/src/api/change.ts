import { apiClient } from "./client";
import type {
  ChangeDto,
  ChangeFileDto,
  ChangeLabelDto,
  ChangeListResponse,
  ChangePartDto,
  CreateChangeRequest,
  UpdateChangeRequest,
  IssueLabelDto,
  IssueTimelineItemDto,
  IssueTimelineResponse,
  LinkedIssueBadgeDto,
  TimelineUserDto,
  UserSummaryDto,
  CommentDto,
} from "./types";

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
  project_id: string;
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

interface ApiLabelListResponse {
  items?: ApiChangeLabelResponse[];
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

function mapChangeLabel(label: ApiChangeLabelResponse): ChangeLabelDto | null {
  if (!label.id || !label.name || !label.color) return null;
  return {
    id: label.id,
    name: label.name,
    color: label.color,
  };
}

function mapUserSummary(
  user: ApiChangeAssigneeResponse,
): UserSummaryDto | null {
  if (!user.user_id || !user.full_name) return null;
  return {
    id: user.user_id,
    fullName: user.full_name,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function mapChangePart(part: ApiChangePartResponse): ChangePartDto {
  return {
    id: part.id,
    partNumber: part.part_number,
    name: part.name ?? null,
  };
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

function mapLinkedIssue(
  item: ApiLinkedIssueBadgeResponse,
): LinkedIssueBadgeDto {
  return {
    id: item.id,
    number: item.number,
    title: item.title,
    state: item.state,
  };
}

function mapChange(item: ApiChangeResponse): ChangeDto {
  return {
    id: item.id,
    projectId: item.project_id,
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
    labels: (item.labels ?? [])
      .map(mapChangeLabel)
      .filter((label): label is ChangeLabelDto => label !== null),
    assignees: (item.assignees ?? [])
      .map(mapUserSummary)
      .filter((assignee): assignee is UserSummaryDto => assignee !== null),
    reviewers: (item.reviewers ?? [])
      .map(mapUserSummary)
      .filter((reviewer): reviewer is UserSummaryDto => reviewer !== null),
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

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as ApiChangeListEnvelope).items)
  ) {
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

function mapTimelineItem(
  item: ApiTimelineCommentItem | ApiTimelineActivityItem,
): IssueTimelineItemDto {
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

// ============================================================
// API 함수
// ============================================================

/** 프로젝트 변경 요청 생성 */
export async function createProjectChange(
  projectId: string,
  request: CreateChangeRequest,
): Promise<ChangeDto> {
  const body: Record<string, unknown> = {
    title: request.title,
    body: request.body,
  };
  if (request.issueNumber != null) {
    body.issue_number = request.issueNumber;
  }
  const response = await apiClient.post<ApiChangeResponse>(
    `/api/v1/projects/${projectId}/changes`,
    body,
  );
  return mapChange(response.data);
}

/** 변경 요청 수정 (제목/본문) */
export async function updateChange(
  projectId: string,
  changeNumber: string,
  request: UpdateChangeRequest,
): Promise<ChangeDto> {
  const response = await apiClient.patch<ApiChangeResponse>(
    `/api/v1/projects/${projectId}/changes/${changeNumber}`,
    request,
  );
  return mapChange(response.data);
}

/** 프로젝트 변경 요청 목록 조회 */
export async function getProjectChanges(
  projectId: string,
): Promise<ChangeListResponse> {
  const response = await apiClient.get<unknown>(
    `/api/v1/projects/${projectId}/changes`,
  );
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

/** 프로젝트 변경 요청 상세 조회 */
export async function getProjectChange(
  projectId: string,
  changeNumber: string,
): Promise<ChangeDto> {
  const response = await apiClient.get<ApiChangeResponse>(
    `/api/v1/projects/${projectId}/changes/${changeNumber}`,
  );
  return mapChange(response.data);
}

function mapTimelineUsers(
  raw?: Record<string, ApiTimelineUserResponse>,
): Record<string, TimelineUserDto> {
  if (!raw) return {};
  const result: Record<string, TimelineUserDto> = {};
  for (const [key, u] of Object.entries(raw)) {
    result[key] = {
      id: u.user_id,
      fullName: u.full_name,
      profileImageUrl: u.profile_image_url,
    };
  }
  return result;
}

/** 변경 요청 타임라인 조회 */
export async function getChangeTimeline(
  projectId: string,
  changeNumber: string,
): Promise<IssueTimelineResponse> {
  const response = await apiClient.get<ApiTimelineResponse>(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/timeline`,
  );
  return {
    items: response.data.items.map(mapTimelineItem),
    users: mapTimelineUsers(response.data.users),
  };
}

/** 변경 요청 담당자 동기화 (PUT) */
export async function syncChangeAssignees(
  projectId: string,
  changeNumber: string,
  userIds: string[],
): Promise<void> {
  await apiClient.put(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/assignees`,
    {
      user_ids: userIds,
    },
  );
}

/** 변경 요청 검토자 동기화 (PUT) */
export async function syncChangeReviewers(
  projectId: string,
  changeNumber: string,
  userIds: string[],
): Promise<void> {
  await apiClient.put(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/reviewers`,
    {
      user_ids: userIds,
    },
  );
}

/** 변경 요청용 프로젝트 라벨 목록 조회 */
export async function getChangeLabels(
  projectId: string,
): Promise<IssueLabelDto[]> {
  const response = await apiClient.get<ApiLabelListResponse>(
    `/api/v1/projects/${projectId}/labels`,
  );
  return (response.data.items ?? [])
    .map(mapChangeLabel)
    .filter(
      (label): label is IssueLabelDto => label !== null,
    ) as IssueLabelDto[];
}

/** 변경 요청 라벨 동기화 */
export async function syncChangeLabels(
  projectId: string,
  changeNumber: string,
  labelIds: string[],
): Promise<void> {
  await apiClient.put(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/labels`,
    {
      label_ids: labelIds,
    },
  );
}

/** 변경 요청 부품 동기화 (PUT) */
export async function syncChangeParts(
  projectId: string,
  changeNumber: string,
  partIds: string[],
): Promise<void> {
  await apiClient.put(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/parts`,
    {
      part_ids: partIds,
    },
  );
}

/** 변경 요청에 파일 첨부 */
export async function attachChangeFiles(
  projectId: string,
  changeNumber: string,
  fileIds: string[],
): Promise<void> {
  await apiClient.post(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/files`,
    {
      file_ids: fileIds,
    },
  );
}

/** 변경 요청에서 파일 삭제 */
export async function deleteChangeFile(
  projectId: string,
  changeNumber: string,
  fileId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/files/${fileId}`,
  );
}

/** 변경 요청 댓글 생성 */
export async function createChangeComment(
  projectId: string,
  changeNumber: string,
  body: Record<string, unknown>,
): Promise<CommentDto> {
  const response = await apiClient.post<ApiCommentResponse>(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/comments`,
    { body },
  );
  return mapComment(response.data);
}

/** 변경 요청 댓글 수정 */
export async function updateChangeComment(
  projectId: string,
  changeNumber: string,
  commentId: string,
  body: Record<string, unknown>,
): Promise<CommentDto> {
  const response = await apiClient.patch<ApiCommentResponse>(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/comments/${commentId}`,
    { body },
  );
  return mapComment(response.data);
}

/** 변경 요청 댓글 삭제 */
export async function deleteChangeComment(
  projectId: string,
  changeNumber: string,
  commentId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/comments/${commentId}`,
  );
}

/** 변경 요청 이슈 동기화 */
export async function syncChangeIssues(
  projectId: string,
  changeNumber: string,
  issueIds: string[],
): Promise<void> {
  await apiClient.put(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/issues`,
    {
      issue_ids: issueIds,
    },
  );
}

/** 변경 요청 닫기 */
export async function closeChange(
  projectId: string,
  changeNumber: string,
): Promise<ChangeDto> {
  const response = await apiClient.post<ApiChangeResponse>(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/close`,
  );
  return mapChange(response.data);
}

/** 변경 요청 변경 반영 (merge) */
export async function mergeChange(
  projectId: string,
  changeNumber: string,
): Promise<ChangeDto> {
  const response = await apiClient.post<ApiChangeResponse>(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/merge`,
  );
  return mapChange(response.data);
}

/** 변경 요청 제출 (DRAFT → SUBMITTED) */
export async function submitChange(
  projectId: string,
  changeNumber: string,
): Promise<ChangeDto> {
  const response = await apiClient.post<ApiChangeResponse>(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/submit`,
  );
  return mapChange(response.data);
}

/** 변경 요청 다시 제출 (CLOSED → SUBMITTED) */
export async function reopenChange(
  projectId: string,
  changeNumber: string,
): Promise<ChangeDto> {
  const response = await apiClient.post<ApiChangeResponse>(
    `/api/v1/projects/${projectId}/changes/${changeNumber}/reopen`,
  );
  return mapChange(response.data);
}
