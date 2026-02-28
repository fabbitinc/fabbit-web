import { apiClient } from "./client";
import type {
  ProjectDto,
  ProjectListResponse,
  ListProjectsParams,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectPartListResponse,
  LinkPartsRequest,
  LinkPartsResponse,
  ProjectMemberDto,
  ProjectMemberListResponse,
  ManageMembersRequest,
  ManageMembersResponse,
} from "./types";

interface ApiProjectSummaryResponse {
  id: string;
  name: string;
  description?: string | null;
  part_count: number;
}

interface ApiProjectDetailResponse {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  part_count?: number;
}

interface ApiProjectListResponse {
  total: number;
  offset: number;
  limit: number;
  items: ApiProjectSummaryResponse[];
}

function toProjectDto(project: ApiProjectDetailResponse): ProjectDto {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    color: null,
    status: "ACTIVE",
    createdAt: project.created_at ?? "",
    updatedAt: project.updated_at ?? "",
    partCount: project.part_count ?? 0,
  };
}

function toProjectListItemDto(project: ApiProjectSummaryResponse): ProjectDto {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    color: null,
    status: "ACTIVE",
    createdAt: "",
    updatedAt: "",
    partCount: project.part_count,
  };
}

/**
 * 프로젝트 목록 조회
 * GET /api/v1/projects
 */
export async function getProjects(params?: ListProjectsParams): Promise<ProjectListResponse> {
  const response = await apiClient.get<ApiProjectListResponse>("/api/v1/projects", {
    params,
  });
  const payload = response.data;

  return {
    total: payload.total,
    offset: payload.offset,
    limit: payload.limit,
    items: payload.items.map(toProjectListItemDto),
  };
}

/**
 * 프로젝트 생성
 * POST /api/v1/projects
 */
export async function createProject(request: CreateProjectRequest): Promise<ProjectDto> {
  const response = await apiClient.post<ApiProjectDetailResponse>("/api/v1/projects", request);
  return toProjectDto(response.data);
}

/**
 * 프로젝트 상세 조회
 * GET /api/v1/projects/{project_id}
 */
export async function getProject(projectId: string): Promise<ProjectDto> {
  const response = await apiClient.get<ApiProjectDetailResponse>(`/api/v1/projects/${projectId}`);
  return toProjectDto(response.data);
}

/**
 * 프로젝트 수정
 * PATCH /api/v1/projects/{project_id}
 */
export async function updateProject(projectId: string, request: UpdateProjectRequest): Promise<ProjectDto> {
  const response = await apiClient.patch<ApiProjectDetailResponse>(`/api/v1/projects/${projectId}`, request);
  return toProjectDto(response.data);
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
export async function getProjectParts(projectId: string, search?: string): Promise<ProjectPartListResponse> {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  const response = await apiClient.get<ProjectPartListResponse>(`/api/v1/projects/${projectId}/parts`, { params });
  return response.data;
}

/**
 * 프로젝트에 부품 일괄 연결
 * POST /api/v1/projects/{project_id}/parts
 */
export async function linkPartsToProject(projectId: string, partIds: string[]): Promise<LinkPartsResponse> {
  const payload: LinkPartsRequest = { part_ids: partIds };
  const response = await apiClient.post<LinkPartsResponse>(`/api/v1/projects/${projectId}/parts`, payload);
  return response.data;
}

/**
 * 프로젝트에서 부품 일괄 해제
 * DELETE /api/v1/projects/{project_id}/parts
 */
export async function unlinkPartsFromProject(projectId: string, partIds: string[]): Promise<void> {
  const payload: LinkPartsRequest = { part_ids: partIds };
  await apiClient.delete(`/api/v1/projects/${projectId}/parts`, { data: payload });
}

/**
 * 프로젝트에 부품 연결
 * POST /api/v1/projects/{project_id}/parts
 */
export async function addPartToProject(projectId: string, partId: string): Promise<void> {
  await linkPartsToProject(projectId, [partId]);
}

/**
 * 프로젝트에서 부품 해제
 * DELETE /api/v1/projects/{project_id}/parts
 */
export async function removePartFromProject(projectId: string, partId: string): Promise<void> {
  await unlinkPartsFromProject(projectId, [partId]);
}

// --- 프로젝트 멤버 ---

interface ApiProjectMemberSummary {
  user_id: string;
  full_name: string;
  email: string;
}

interface ApiProjectMemberListResponse {
  items: ApiProjectMemberSummary[];
}

function toProjectMemberDto(m: ApiProjectMemberSummary): ProjectMemberDto {
  return { userId: m.user_id, fullName: m.full_name, email: m.email };
}

/** 프로젝트 멤버 목록 조회 */
export async function getProjectMembers(projectId: string): Promise<ProjectMemberListResponse> {
  const response = await apiClient.get<ApiProjectMemberListResponse>(`/api/v1/projects/${projectId}/members`);
  return { items: response.data.items.map(toProjectMemberDto) };
}

/** 프로젝트에 멤버 추가 */
export async function addProjectMembers(projectId: string, userIds: string[]): Promise<ManageMembersResponse> {
  const payload: ManageMembersRequest = { user_ids: userIds };
  const response = await apiClient.post<ManageMembersResponse>(`/api/v1/projects/${projectId}/members`, payload);
  return response.data;
}

/** 프로젝트에서 멤버 제거 */
export async function removeProjectMembers(projectId: string, userIds: string[]): Promise<void> {
  const payload: ManageMembersRequest = { user_ids: userIds };
  await apiClient.delete(`/api/v1/projects/${projectId}/members`, { data: payload });
}
