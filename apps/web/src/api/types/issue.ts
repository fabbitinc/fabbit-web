export interface IssueLabelDto {
  id: string;
  name: string;
  color: string;
}

export interface IssueAssigneeDto {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
}

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

export interface IssueDto {
  id: string;
  projectId: string;
  number: number;
  type: string;
  title: string;
  body: Record<string, unknown> | string | null;
  state: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  createdBy: string | null;
  createdByName?: string | null;
  labels: IssueLabelDto[];
  assignees: IssueAssigneeDto[];
  parts: IssuePartDto[];
  files: IssueFileDto[];
  commentsCount: number;
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
}

export interface IssueTimelineActivityDto {
  type: "activity";
  id: string;
  action: string;
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
