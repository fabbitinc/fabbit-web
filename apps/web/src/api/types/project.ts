import type { ProjectStatus } from "./common";

// GET /api/v1/projects
export interface ListProjectsParams {
  search?: string;
  offset?: number;
  limit?: number;
}

export interface ProjectDto {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  partCount: number;
}

export interface ProjectListResponse {
  total: number;
  offset: number;
  limit: number;
  items: ProjectDto[];
}

// POST /api/v1/projects
export interface CreateProjectRequest {
  name: string;
  description?: string | null;
}

// PATCH /api/v1/projects/{project_id}
export interface UpdateProjectRequest {
  name?: string | null;
  description?: string | null;
  color?: string | null;
}

// GET /api/v1/projects/{project_id}/parts
export interface ProjectPartResponse {
  id: string;
  part_number: string;
  name: string | null;
  category: string | null;
}

export interface ProjectPartListResponse {
  parts: ProjectPartResponse[];
}

export interface LinkPartsRequest {
  part_ids: string[];
}

export interface LinkPartsResponse {
  linked_count: number;
}

// GET /api/v1/projects/{project_id}/members
export interface ProjectMemberDto {
  userId: string;
  fullName: string;
  email: string;
}

export interface ProjectMemberListResponse {
  items: ProjectMemberDto[];
}

// POST/DELETE /api/v1/projects/{project_id}/members
export interface ManageMembersRequest {
  user_ids: string[];
}

export interface ManageMembersResponse {
  count: number;
}
