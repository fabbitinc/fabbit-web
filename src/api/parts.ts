import { apiClient } from "./client";
import type {
  PartListResponse,
  PartFilterOptions,
  ListPartsParams,
  PartDetailResponse,
  BomTreeResponse,
  RegisterDrawingResponse,
} from "./types/parts";

/** Part 필터 옵션 조회 (카테고리, 수명주기 DISTINCT 값) */
export async function getPartFilterOptions(): Promise<PartFilterOptions> {
  const response = await apiClient.get<PartFilterOptions>(
    "/api/v1/parts/filter-options",
  );
  return response.data;
}

/** Part 목록 조회 */
export async function listParts(
  params: ListPartsParams = {},
): Promise<PartListResponse> {
  const response = await apiClient.get<PartListResponse>("/api/v1/parts", {
    params,
  });
  return response.data;
}

/** Part 상세 조회 */
export async function getPartDetail(
  partId: string,
): Promise<PartDetailResponse> {
  const response = await apiClient.get<PartDetailResponse>(
    `/api/v1/parts/${partId}`,
  );
  return response.data;
}

/** Part BOM 트리 조회 */
export async function getPartBomTree(
  partId: string,
): Promise<BomTreeResponse> {
  const response = await apiClient.get<BomTreeResponse>(
    `/api/v1/parts/${partId}/bom-tree`,
  );
  return response.data;
}

/** Part에 연결된 도면 삭제 */
export async function deleteDrawingFromPart(partId: string): Promise<void> {
  await apiClient.delete(`/api/v1/parts/${partId}/drawings`);
}

/** Part에 도면 등록 */
export async function registerDrawingForPart(
  partId: string,
  fileId: string,
): Promise<RegisterDrawingResponse> {
  const response = await apiClient.post<RegisterDrawingResponse>(
    `/api/v1/parts/${partId}/drawings`,
    { file_id: fileId },
  );
  return response.data;
}
