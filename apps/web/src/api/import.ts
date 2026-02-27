import { apiClient } from "./client";
import type {
  BomAnalyzeParams,
  BomAnalyzeRequest,
  BomAnalyzeResponse,
  BomExecuteRequest,
  BomExecuteResponse,
} from "./types";

/**
 * BOM 분석
 * POST /api/v1/items/import/bom/analyze
 *
 * 업로드된 파일에서 BOM 정보를 추출합니다.
 */
export async function analyzeBom(
  params: BomAnalyzeParams,
  request: BomAnalyzeRequest
): Promise<BomAnalyzeResponse> {
  const response = await apiClient.post<BomAnalyzeResponse>(
    "/api/v1/items/import/bom/analyze",
    request,
    {
      params: {
        projectId: params.projectId,
        ...(params.folderId && { folderId: params.folderId }),
      },
    }
  );
  return response.data;
}

/**
 * BOM 생성 실행
 * POST /api/v1/items/import/bom/execute
 *
 * 분석된 BOM 데이터를 기반으로 품목과 BOM을 생성합니다.
 */
export async function executeBom(
  request: BomExecuteRequest
): Promise<BomExecuteResponse> {
  const response = await apiClient.post<BomExecuteResponse>(
    "/api/v1/items/import/bom/execute",
    request
  );
  return response.data;
}
