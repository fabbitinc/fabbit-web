import { apiClient } from "./client";
import type {
  AttributeDefinitionDto,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  BatchCreateAttributeRequest,
  SyncAttributesRequest,
  SimpleBomImportRequest,
  SimpleBomImportResponse,
} from "./types";

/**
 * 프로젝트 속성 목록 조회
 * GET /api/v1/projects/:projectId/attributes
 */
export async function getAttributes(
  projectId: string,
): Promise<AttributeDefinitionDto[]> {
  const response = await apiClient.get<AttributeDefinitionDto[]>(
    `/api/v1/projects/${projectId}/attributes`,
  );
  return response.data;
}

/**
 * 속성 생성
 * POST /api/v1/projects/:projectId/attributes
 */
export async function createAttribute(
  projectId: string,
  request: CreateAttributeRequest,
): Promise<AttributeDefinitionDto> {
  const response = await apiClient.post<AttributeDefinitionDto>(
    `/api/v1/projects/${projectId}/attributes`,
    request,
  );
  return response.data;
}

/**
 * 속성 수정
 * PUT /api/v1/projects/:projectId/attributes/:id
 */
export async function updateAttribute(
  projectId: string,
  attributeId: string,
  request: UpdateAttributeRequest,
): Promise<AttributeDefinitionDto> {
  const response = await apiClient.put<AttributeDefinitionDto>(
    `/api/v1/projects/${projectId}/attributes/${attributeId}`,
    request,
  );
  return response.data;
}

/**
 * 속성 삭제
 * DELETE /api/v1/projects/:projectId/attributes/:id
 */
export async function deleteAttribute(
  projectId: string,
  attributeId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/v1/projects/${projectId}/attributes/${attributeId}`,
  );
}

/**
 * 속성 일괄 동기화
 * PUT /api/v1/projects/:projectId/attributes/sync
 */
export async function syncAttributes(
  projectId: string,
  request: SyncAttributesRequest,
): Promise<AttributeDefinitionDto[]> {
  const response = await apiClient.put<AttributeDefinitionDto[]>(
    `/api/v1/projects/${projectId}/attributes/sync`,
    request,
  );
  return response.data;
}

/**
 * 속성 일괄 생성
 * POST /api/v1/projects/:projectId/attributes/batch
 */
export async function batchCreateAttributes(
  projectId: string,
  request: BatchCreateAttributeRequest,
): Promise<AttributeDefinitionDto[]> {
  const response = await apiClient.post<AttributeDefinitionDto[]>(
    `/api/v1/projects/${projectId}/attributes/batch`,
    request,
  );
  return response.data;
}

/**
 * 단순 BOM 가져오기
 * POST /api/v1/items/import/bom/simple
 */
export async function importBomSimple(
  request: SimpleBomImportRequest,
): Promise<SimpleBomImportResponse> {
  const response = await apiClient.post<SimpleBomImportResponse>(
    "/api/v1/items/import/bom/simple",
    request,
  );
  return response.data;
}
