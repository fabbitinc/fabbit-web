export interface ChangeLabelDto {
  id: string;
  name: string;
  color: string;
}

export interface ChangeAssigneeDto {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
}

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
  createdBy: string | null;
  createdByName?: string | null;
  labels: ChangeLabelDto[];
  assignees: ChangeAssigneeDto[];
  reviewers: ChangeAssigneeDto[];
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
