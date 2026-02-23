import { apiClient } from "./client";
import type {
  MappingPreviewRequest,
  MappingPreviewResponse,
  MappingConfirmRequest,
  MappingUpdateRequest,
  MappingResponse,
  MappingListResponse,
  MappingValidateRequest,
  MappingValidateResponse,
} from "./types/mapping";

/**
 * 매핑 미리보기 (LLM 분석)
 * POST /api/v1/mappings/preview
 */
export async function previewMapping(
  request: MappingPreviewRequest,
): Promise<MappingPreviewResponse> {
  const response = await apiClient.post<MappingPreviewResponse>(
    "/api/v1/mappings/preview",
    request,
    { timeout: 120000 }, // LLM 분석은 시간이 오래 걸릴 수 있음
  );
  return response.data;
}

/**
 * 매핑 확정
 * POST /api/v1/mappings/confirm
 */
export async function confirmMapping(
  request: MappingConfirmRequest,
): Promise<MappingResponse> {
  const response = await apiClient.post<MappingResponse>(
    "/api/v1/mappings/confirm",
    request,
  );
  return response.data;
}

/**
 * 매핑 목록 조회
 * GET /api/v1/mappings
 */
export async function listMappings(): Promise<MappingListResponse> {
  const response = await apiClient.get<MappingListResponse>("/api/v1/mappings");
  return response.data;
}

/**
 * 매핑 업데이트
 * PUT /api/v1/mappings/{mapping_id}
 */
export async function updateMapping(
  mappingId: string,
  request: MappingUpdateRequest,
): Promise<MappingResponse> {
  const response = await apiClient.put<MappingResponse>(
    `/api/v1/mappings/${mappingId}`,
    request,
  );
  return response.data;
}

/**
 * 매핑 검증
 * POST /api/v1/mappings/validate
 */
export async function validateMapping(
  request: MappingValidateRequest,
): Promise<MappingValidateResponse> {
  const response = await apiClient.post<MappingValidateResponse>(
    "/api/v1/mappings/validate",
    request,
  );
  return response.data;
}
