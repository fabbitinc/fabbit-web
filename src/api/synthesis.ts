import { apiClient } from "./client";
import type {
  SynthesisStartRequest,
  SynthesisBatchStartResponse,
  SynthesisBatchStatusResponse,
  SynthesisJobResponse,
} from "./types/synthesis";

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
