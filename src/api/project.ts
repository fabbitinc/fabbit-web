import { apiClient } from "./client";
import type {
  ProjectDto,
  ProjectListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectPartListResponse,
} from "./types";

/**
 * 프로젝트 목록 조회
 * GET /api/v1/projects
 */
export async function getProjects(): Promise<ProjectListResponse> {
  const response = await apiClient.get<ProjectListResponse>("/api/v1/projects");
  return response.data;
}

/**
 * 프로젝트 생성
 * POST /api/v1/projects
 */
export async function createProject(request: CreateProjectRequest): Promise<ProjectDto> {
  const response = await apiClient.post<ProjectDto>("/api/v1/projects", request);
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

/**
 * 프로젝트 삭제
 * DELETE /api/v1/projects/{project_id}
 */
export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${projectId}`);
}

/**
 * 프로젝트 부품 목록 조회
 * GET /api/v1/projects/{project_id}/parts
 */
export async function getProjectParts(projectId: string): Promise<ProjectPartListResponse> {
  const response = await apiClient.get<ProjectPartListResponse>(`/api/v1/projects/${projectId}/parts`);
  return response.data;
}

/**
 * 프로젝트에 부품 연결
 * POST /api/v1/projects/{project_id}/parts/{part_id}
 */
export async function addPartToProject(projectId: string, partId: string): Promise<void> {
  await apiClient.post(`/api/v1/projects/${projectId}/parts/${partId}`);
}

/**
 * 프로젝트에서 부품 해제
 * DELETE /api/v1/projects/{project_id}/parts/{part_id}
 */
export async function removePartFromProject(projectId: string, partId: string): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${projectId}/parts/${partId}`);
}
