import { apiClient } from "./client";
import type {
  AttributeDefinitionDto,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  BatchCreateAttributeRequest,
  BulkSaveDefinitionsRequest,
  SimpleBomImportRequest,
  SimpleBomImportResponse,
  SuggestAttributesResponse,
} from "./types";

/**
 * 프로젝트 속성 정의 목록 조회
 * GET /api/v1/projects/:projectId/attributes/definitions
 */
export async function getAttributes(
  projectId: string,
): Promise<AttributeDefinitionDto[]> {
  const response = await apiClient.get<AttributeDefinitionDto[]>(
    `/api/v1/projects/${projectId}/attributes/definitions`,
  );
  return response.data;
}

/**
 * 프로젝트 속성 정의 일괄 저장
 * PUT /api/v1/projects/:projectId/attributes/definitions
 */
export async function bulkSaveDefinitions(
  projectId: string,
  request: BulkSaveDefinitionsRequest,
): Promise<AttributeDefinitionDto[]> {
  const response = await apiClient.put<AttributeDefinitionDto[]>(
    `/api/v1/projects/${projectId}/attributes/definitions`,
    request,
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

/**
 * BOM 파일에서 속성 제안 (multipart/form-data)
 * POST /api/v1/attributes/definitions/suggest
 */
export async function suggestAttributes(
  file: File,
  locale: string = "ko",
): Promise<SuggestAttributesResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("locale", locale);

  const response = await apiClient.post<SuggestAttributesResponse>(
    "/api/v1/attributes/definitions/suggest",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    },
  );
  return response.data;
}
