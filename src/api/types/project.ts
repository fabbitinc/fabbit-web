import type { ProjectStatus } from "./common";

// GET /api/v1/projects
// API는 ProjectResponseSchema[] 배열을 직접 반환
export interface ProjectDto {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProjectListResponse = ProjectDto[];

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
