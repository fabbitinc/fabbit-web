import { apiClient } from "./client";
import { downloadExcel } from "@/utils/downloadExcel";
import type {
  CategoryStatsResponse,
  RenameCategoryRequest,
  PartDefaultOwnerListResponse,
  PartDefaultOwnerItem,
  PartDefaultOwnerRequest,
  PartListResponse,
  PartFilterOptions,
  ListPartsParams,
  PartDetailResponse,
  BomTreeResponse,
  RegisterDrawingResponse,
  ExportPartsParams,
  ExportBomParams,
  PartFileItem,
  AttachFilesRequest,
  PartLookupResponse,
  LookupPartsParams,
  PartProjectsResponse,
  PartBomResponse,
  PartSuppliersResponse,
  PartFilesResponse,
  PartOwnerResponse,
  UpdatePartOwnerRequest,
} from "./types/parts";

/** 카테고리 목록 조회 (부품 개수 포함) */
export async function listCategories(): Promise<CategoryStatsResponse> {
  const response = await apiClient.get<CategoryStatsResponse>(
    "/api/v1/parts/categories",
  );
  return response.data;
}

/** 카테고리 이름 변경 */
export async function renameCategory(
  category: string,
  request: RenameCategoryRequest,
): Promise<void> {
  await apiClient.patch(
    `/api/v1/parts/categories/${encodeURIComponent(category)}`,
    request,
  );
}

/** 기본 담당 설정 목록 조회 */
export async function listDefaultOwners(): Promise<PartDefaultOwnerListResponse> {
  const response = await apiClient.get<PartDefaultOwnerListResponse>(
    "/api/v1/parts/owner/defaults",
  );
  return response.data;
}

/** 기본 담당 설정 upsert */
export async function upsertDefaultOwner(
  request: PartDefaultOwnerRequest,
): Promise<PartDefaultOwnerItem> {
  const response = await apiClient.put<PartDefaultOwnerItem>(
    "/api/v1/parts/owner/defaults",
    request,
  );
  return response.data;
}

/** 기본 담당 설정 삭제 */
export async function deleteDefaultOwner(
  category?: string | null,
): Promise<void> {
  await apiClient.delete("/api/v1/parts/owner/defaults", {
    params: category != null ? { category } : undefined,
  });
}

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

/** 부품 Lookup 조회 (picker용 경량 목록, exclude_linked로 이미 연결된 부품 제외 가능) */
export async function lookupParts(
  params: LookupPartsParams,
): Promise<PartLookupResponse> {
  const { project_id, ...queryParams } = params;
  const response = await apiClient.get<PartLookupResponse>(
    `/api/v1/projects/${project_id}/parts/lookup`,
    { params: queryParams },
  );
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

/** Part BOM 조회 (children + parents) */
export async function getPartBom(
  partId: string,
): Promise<PartBomResponse> {
  const response = await apiClient.get<PartBomResponse>(
    `/api/v1/parts/${partId}/bom`,
  );
  return response.data;
}

/** Part 공급사 조회 */
export async function getPartSuppliers(
  partId: string,
): Promise<PartSuppliersResponse> {
  const response = await apiClient.get<PartSuppliersResponse>(
    `/api/v1/parts/${partId}/suppliers`,
  );
  return response.data;
}

/** Part 첨부 파일 조회 */
export async function getPartFiles(
  partId: string,
): Promise<PartFilesResponse> {
  const response = await apiClient.get<PartFilesResponse>(
    `/api/v1/parts/${partId}/files`,
  );
  return response.data;
}

/** Part BOM 트리 조회 */
export async function getPartBomTree(
  partId: string,
  direction: "forward" | "reverse" = "forward",
): Promise<BomTreeResponse> {
  const response = await apiClient.get<BomTreeResponse>(
    `/api/v1/parts/${partId}/bom/tree`,
    { params: { direction } },
  );
  return response.data;
}

/** Part에 연결된 도면 삭제 */
export async function deleteDrawingFromPart(partId: string): Promise<void> {
  await apiClient.delete(`/api/v1/parts/${partId}/drawings`);
}

/** 부품 목록 Excel 내보내기 */
export async function exportParts(params: ExportPartsParams): Promise<void> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.lifecycle_state) query.set("lifecycle_state", params.lifecycle_state);
  if (params.has_drawing != null) query.set("has_drawing", String(params.has_drawing));
  if (params.has_children != null) query.set("has_children", String(params.has_children));
  if (params.mapping_id) query.set("mapping_id", params.mapping_id);
  if (params.project_id) query.set("project_id", params.project_id);
  // FastAPI는 배열을 반복 쿼리 파라미터로 받음 (?part_ids=a&part_ids=b)
  if (params.part_ids?.length) {
    for (const id of params.part_ids) query.append("part_ids", id);
  }

  const qs = query.toString();
  const url = `/api/v1/parts/export${qs ? `?${qs}` : ""}`;
  await downloadExcel(url, "parts.xlsx");
}

/** Part BOM 트리 Excel 내보내기 */
export async function exportBom(
  partId: string,
  params: ExportBomParams = {},
): Promise<void> {
  const query = new URLSearchParams();
  if (params.direction) query.set("direction", params.direction);
  if (params.mapping_id) query.set("mapping_id", params.mapping_id);

  const qs = query.toString();
  const url = `/api/v1/parts/${partId}/bom/tree/export${qs ? `?${qs}` : ""}`;
  await downloadExcel(url, "bom.xlsx");
}

/** Part에 첨부 파일 연결 */
export async function attachFilesToPart(
  partId: string,
  request: AttachFilesRequest,
): Promise<PartFileItem[]> {
  const response = await apiClient.post<PartFileItem[]>(
    `/api/v1/parts/${partId}/files`,
    request,
  );
  return response.data;
}

/** Part 첨부 파일 제거 */
export async function detachFileFromPart(
  partId: string,
  fileId: string,
): Promise<void> {
  await apiClient.delete(`/api/v1/parts/${partId}/files/${fileId}`);
}

/** 부품이 속한 프로젝트 목록 조회 */
export async function getPartProjects(
  partId: string,
): Promise<PartProjectsResponse> {
  const response = await apiClient.get<PartProjectsResponse>(
    `/api/v1/parts/${partId}/projects`,
  );
  return response.data;
}

/** Part 담당자/팀 조회 */
export async function getPartOwner(
  partId: string,
): Promise<PartOwnerResponse> {
  const response = await apiClient.get<PartOwnerResponse>(
    `/api/v1/parts/${partId}/owner`,
  );
  return response.data;
}

/** Part 담당자/팀 수정 (PATCH) */
export async function updatePartOwner(
  partId: string,
  request: UpdatePartOwnerRequest,
): Promise<PartOwnerResponse> {
  const response = await apiClient.patch<PartOwnerResponse>(
    `/api/v1/parts/${partId}/owner`,
    request,
  );
  return response.data;
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
