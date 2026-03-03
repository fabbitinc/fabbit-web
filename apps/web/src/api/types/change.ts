export interface ChangeLabelDto {
  id: string;
  name: string;
  color: string;
}

import type { UserSummaryDto } from "./issue";

/** @deprecated UserSummaryDto 사용 */
export type ChangeAssigneeDto = UserSummaryDto;

export interface ChangePartDto {
  id: string;
  partNumber: string;
  name: string | null;
}

export interface ChangeFileDto {
  fileId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
}

export interface LinkedIssueBadgeDto {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface ChangeDto {
  id: string;
  projectId: string | null;
  number: number;
  type: string;
  title: string;
  body: Record<string, unknown> | string | null;
  state: string;
  crState: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  isModified?: boolean;
  createdBy: UserSummaryDto | null;
  labels: ChangeLabelDto[];
  assignees: UserSummaryDto[];
  reviewers: UserSummaryDto[];
  parts: ChangePartDto[];
  files: ChangeFileDto[];
  commentsCount: number;
  linkedIssues: LinkedIssueBadgeDto[];
}

export interface ChangeListResponse {
  openCount: number;
  closedCount: number;
  total: number;
  offset: number;
  limit: number;
  items: ChangeDto[];
}

export interface CreateChangeRequest {
  title: string;
  body?: Record<string, unknown> | null;
  issueNumber?: number | null;
  assignee_user_ids?: string[];
  reviewer_user_ids?: string[];
  label_ids?: string[];
  part_ids?: string[];
  file_ids?: string[];
}

export interface UpdateChangeRequest {
  title?: string | null;
  body?: Record<string, unknown> | null;
}
