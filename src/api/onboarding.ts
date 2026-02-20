import { apiClient } from "./client";
import type {
  CreateUploadRequest,
  CreateUploadResponse,
  BatchCreateUploadRequest,
  BatchCreateUploadResponse,
  BatchCompleteRequest,
  BatchCompleteResponse,
  UploadCompleteResponse,
  MappingPreviewRequest,
  MappingPreviewResponse,
  MappingConfirmRequest,
  MappingUpdateRequest,
  MappingResponse,
  MappingListResponse,
  MappingValidateRequest,
  MappingValidateResponse,
  SynthesisStartRequest,
  SynthesisBatchStartResponse,
  SynthesisBatchStatusResponse,
  SynthesisJobResponse,
  OntologySchemaResponse,
  NodeSearchResponse,
  HealthCheckResponse,
  QueryRequest,
  QueryResponse,
  StartersResponse,
} from "./types/onboarding";

// ─── Upload ───

/**
 * 단일 업로드 생성 (presigned URL 발급)
 * POST /api/v1/uploads
 */
export async function createUpload(
  request: CreateUploadRequest,
): Promise<CreateUploadResponse> {
  const response = await apiClient.post<CreateUploadResponse>(
    "/api/v1/uploads",
    request,
  );
  return response.data;
}

/**
 * 배치 업로드 생성 (presigned URL 발급)
 * POST /api/v1/uploads/batch
 */
export async function batchCreateUploads(
  request: BatchCreateUploadRequest,
): Promise<BatchCreateUploadResponse> {
  const response = await apiClient.post<BatchCreateUploadResponse>(
    "/api/v1/uploads/batch",
    request,
  );
  return response.data;
}

/**
 * 단일 업로드 완료 확인
 * POST /api/v1/uploads/{upload_id}/complete
 */
export async function completeUpload(
  uploadId: string,
): Promise<UploadCompleteResponse> {
  const response = await apiClient.post<UploadCompleteResponse>(
    `/api/v1/uploads/${uploadId}/complete`,
  );
  return response.data;
}

/**
 * 배치 업로드 완료 확인
 * POST /api/v1/uploads/batch/complete
 */
export async function batchCompleteUploads(
  request: BatchCompleteRequest,
): Promise<BatchCompleteResponse> {
  const response = await apiClient.post<BatchCompleteResponse>(
    "/api/v1/uploads/batch/complete",
    request,
  );
  return response.data;
}

/**
 * Presigned URL로 파일 업로드
 */
export async function uploadFileToUrl(
  uploadUrl: string,
  file: File,
): Promise<void> {
  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
}

// ─── Mapping ───

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

// ─── Synthesis ───

/**
 * 합성 작업 시작
 * POST /api/v1/synthesis
 */
export async function startSynthesis(
  request: SynthesisStartRequest,
): Promise<SynthesisBatchStartResponse> {
  const response = await apiClient.post<SynthesisBatchStartResponse>(
    "/api/v1/synthesis",
    request,
  );
  return response.data;
}

/**
 * 합성 배치 상태 조회
 * GET /api/v1/synthesis/batches/{batch_id}
 */
export async function getSynthesisBatch(
  batchId: string,
): Promise<SynthesisBatchStatusResponse> {
  const response = await apiClient.get<SynthesisBatchStatusResponse>(
    `/api/v1/synthesis/batches/${batchId}`,
  );
  return response.data;
}

/**
 * 합성 작업 상태 조회
 * GET /api/v1/synthesis/{job_id}
 */
export async function getSynthesisJob(
  jobId: string,
): Promise<SynthesisJobResponse> {
  const response = await apiClient.get<SynthesisJobResponse>(
    `/api/v1/synthesis/${jobId}`,
  );
  return response.data;
}

// ─── Ontology ───

/**
 * 온톨로지 스키마 조회 (인증 불필요)
 * GET /api/v1/ontology/schema
 */
export async function getOntologySchema(): Promise<OntologySchemaResponse> {
  const response = await apiClient.get<OntologySchemaResponse>(
    "/api/v1/ontology/schema",
  );
  return response.data;
}

/**
 * 노드 라벨별 merge key 검색 (root_context 자동완성용)
 * GET /api/v1/ontology/nodes/search
 */
export async function searchNodes(
  label: string,
  search: string,
  limit = 10,
): Promise<NodeSearchResponse> {
  const response = await apiClient.get<NodeSearchResponse>(
    "/api/v1/ontology/nodes/search",
    { params: { label, search, limit } },
  );
  return response.data;
}

// ─── Activation ───

/**
 * 헬스 체크
 * POST /api/v1/activation/health-check
 */
export async function healthCheck(): Promise<HealthCheckResponse> {
  const response = await apiClient.post<HealthCheckResponse>(
    "/api/v1/activation/health-check",
  );
  return response.data;
}

/**
 * 그래프 쿼리 (AI)
 * POST /api/v1/activation/query
 */
export async function queryGraph(
  request: QueryRequest,
): Promise<QueryResponse> {
  const response = await apiClient.post<QueryResponse>(
    "/api/v1/activation/query",
    request,
    { timeout: 60000 },
  );
  return response.data;
}

/**
 * 추천 질문 조회
 * GET /api/v1/activation/starters
 */
export async function getStarters(): Promise<StartersResponse> {
  const response = await apiClient.get<StartersResponse>(
    "/api/v1/activation/starters",
  );
  return response.data;
}
