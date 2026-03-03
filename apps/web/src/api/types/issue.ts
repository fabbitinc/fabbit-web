export interface IssueLabelDto {
  id: string;
  name: string;
  color: string;
}

/** 유저 요약 (통합: assignee, reviewer, createdBy 등) */
export interface UserSummaryDto {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
}

/** @deprecated UserSummaryDto 사용 */
export type IssueAssigneeDto = UserSummaryDto;

export interface IssuePartDto {
  id: string;
  partNumber: string;
  name: string | null;
}

export interface IssueFileDto {
  fileId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
}

export interface LinkedChangeBadgeDto {
  id: string;
  number: number;
  title: string;
  state: string;
  crState?: string;
}

export interface IssueDto {
  id: string;
  projectId: string | null;
  number: number;
  type: string;
  title: string;
  body: Record<string, unknown> | string | null;
  state: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  isModified?: boolean;
  createdBy: UserSummaryDto | null;
  labels: IssueLabelDto[];
  assignees: UserSummaryDto[];
  parts: IssuePartDto[];
  files: IssueFileDto[];
  commentsCount: number;
  linkedChanges: LinkedChangeBadgeDto[];
}

export interface IssueListResponse {
  openCount: number;
  closedCount: number;
  total: number;
  offset: number;
  limit: number;
  items: IssueDto[];
}

export interface IssueTimelineCommentDto {
  type: "comment";
  id: string;
  body: Record<string, unknown> | null;
  authorId: string | null;
  createdAt: string;
  updatedAt?: string;
  isModified: boolean;
}

export interface IssueTimelineActivityDto {
  type: "activity";
  id: string;
  action: import("./activity").Action;
  scope?: string | null;
  actorId: string;
  detail: Record<string, unknown> | null;
  createdAt: string;
}

export type IssueTimelineItemDto = IssueTimelineCommentDto | IssueTimelineActivityDto;

export interface TimelineUserDto {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
}

export interface IssueTimelineResponse {
  items: IssueTimelineItemDto[];
  users: Record<string, TimelineUserDto>;
}

export interface CreateIssueRequest {
  title: string;
  body?: Record<string, unknown> | null;
  assignee_user_ids?: string[];
  label_ids?: string[];
  part_ids?: string[];
  file_ids?: string[];
}

export interface CommentDto {
  id: string;
  issueId: string;
  body: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export interface CreateCommentRequest {
  body: Record<string, unknown>;
}

export interface UpdateCommentRequest {
  body: Record<string, unknown>;
}

export interface UpdateIssueRequest {
  title?: string | null;
  body?: Record<string, unknown> | null;
}
