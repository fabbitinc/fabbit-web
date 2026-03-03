import { apiClient } from "./client";
import type { LabelDto, LabelListResponse, CreateLabelRequest, UpdateLabelRequest } from "./types";

// --- API 응답 타입 (snake_case) ---

interface ApiLabelResponse {
  id: string;
  project_id: string;
  name: string;
  description?: string | null;
  color: string;
  created_at: string;
  created_by?: string | null;
}

interface ApiLabelListResponse {
  total: number;
  items: ApiLabelResponse[];
}

function toLabelDto(label: ApiLabelResponse): LabelDto {
  return {
    id: label.id,
    projectId: label.project_id,
    name: label.name,
    description: label.description ?? null,
    color: label.color,
    createdAt: label.created_at,
    createdBy: label.created_by ?? null,
  };
}

/**
 * 프로젝트 라벨 목록 조회
 * GET /api/v1/projects/{project_id}/labels
 */
export async function getProjectLabels(projectId: string): Promise<LabelListResponse> {
  const response = await apiClient.get<ApiLabelListResponse>(`/api/v1/projects/${projectId}/labels`);
  return {
    total: response.data.total,
    items: response.data.items.map(toLabelDto),
  };
}

/**
 * 프로젝트 라벨 생성
 * POST /api/v1/projects/{project_id}/labels
 */
export async function createProjectLabel(projectId: string, request: CreateLabelRequest): Promise<LabelDto> {
  const response = await apiClient.post<ApiLabelResponse>(`/api/v1/projects/${projectId}/labels`, request);
  return toLabelDto(response.data);
}

/**
 * 프로젝트 라벨 수정
 * PATCH /api/v1/projects/{project_id}/labels/{label_id}
 */
export async function updateProjectLabel(projectId: string, labelId: string, request: UpdateLabelRequest): Promise<LabelDto> {
  const response = await apiClient.patch<ApiLabelResponse>(`/api/v1/projects/${projectId}/labels/${labelId}`, request);
  return toLabelDto(response.data);
}

/**
 * 프로젝트 라벨 삭제
 * DELETE /api/v1/projects/{project_id}/labels/{label_id}
 */
export async function deleteProjectLabel(projectId: string, labelId: string): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${projectId}/labels/${labelId}`);
}

// --- 테넌트 레벨 라벨 API ---

interface ApiTenantLabelResponse {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  created_at: string;
  created_by?: string | null;
}

interface ApiTenantLabelListResponse {
  total: number;
  items: ApiTenantLabelResponse[];
}

function toTenantLabelDto(label: ApiTenantLabelResponse): LabelDto {
  return {
    id: label.id,
    projectId: "",
    name: label.name,
    description: label.description ?? null,
    color: label.color,
    createdAt: label.created_at,
    createdBy: label.created_by ?? null,
  };
}

/**
 * 테넌트 라벨 목록 조회
 * GET /api/v1/labels
 */
export async function getTenantLabels(): Promise<LabelListResponse> {
  const response = await apiClient.get<ApiTenantLabelListResponse>("/api/v1/labels");
  return {
    total: response.data.total,
    items: response.data.items.map(toTenantLabelDto),
  };
}

/**
 * 테넌트 라벨 생성
 * POST /api/v1/labels
 */
export async function createTenantLabel(request: CreateLabelRequest): Promise<LabelDto> {
  const response = await apiClient.post<ApiTenantLabelResponse>("/api/v1/labels", request);
  return toTenantLabelDto(response.data);
}

/**
 * 테넌트 라벨 수정
 * PATCH /api/v1/labels/{label_id}
 */
export async function updateTenantLabel(labelId: string, request: UpdateLabelRequest): Promise<LabelDto> {
  const response = await apiClient.patch<ApiTenantLabelResponse>(`/api/v1/labels/${labelId}`, request);
  return toTenantLabelDto(response.data);
}

/**
 * 테넌트 라벨 삭제
 * DELETE /api/v1/labels/{label_id}
 */
export async function deleteTenantLabel(labelId: string): Promise<void> {
  await apiClient.delete(`/api/v1/labels/${labelId}`);
}
