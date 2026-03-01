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

export interface ChangeDto {
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
  createdBy: UserSummaryDto | null;
  labels: ChangeLabelDto[];
  assignees: UserSummaryDto[];
  reviewers: UserSummaryDto[];
  parts: ChangePartDto[];
  files: ChangeFileDto[];
  commentsCount: number;
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
}
