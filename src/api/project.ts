import { apiClient } from "./client";
import type { ProjectDto, ProjectListResponse, UpdateProjectRequest } from "./types";

/**
 * 프로젝트 목록 조회
 * GET /api/v1/projects
 */
export async function getProjects(): Promise<ProjectListResponse> {
  const response = await apiClient.get<ProjectListResponse>("/api/v1/projects");
  return response.data;
}

/**
 * 프로젝트 상세 조회
 * GET /api/v1/projects/{project_id}
 */
export async function getProject(projectId: string): Promise<ProjectDto> {
  const response = await apiClient.get<ProjectDto>(`/api/v1/projects/${projectId}`);
  return response.data;
}

/**
 * 프로젝트 수정
 * PATCH /api/v1/projects/{project_id}
 */
export async function updateProject(projectId: string, request: UpdateProjectRequest): Promise<ProjectDto> {
  const response = await apiClient.patch<ProjectDto>(`/api/v1/projects/${projectId}`, request);
  return response.data;
}
