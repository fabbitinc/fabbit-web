import { apiClient } from "./client";
import type {
  CreateUploadRequest,
  CreateUploadResponse,
  BatchCreateUploadRequest,
  BatchCreateUploadResponse,
  BatchCompleteRequest,
  BatchCompleteResponse,
  UploadCompleteResponse,
} from "./types/upload";

/**
 * 단일 업로드 생성 (presigned URL 발급)
 * POST /api/v1/files/upload
 */
export async function createUpload(
  request: CreateUploadRequest,
): Promise<CreateUploadResponse> {
  const response = await apiClient.post<CreateUploadResponse>(
    "/api/v1/files/upload",
    request,
  );
  return response.data;
}

/**
 * 배치 업로드 생성 (presigned URL 발급)
 * POST /api/v1/files/upload/batch
 */
export async function batchCreateUploads(
  request: BatchCreateUploadRequest,
): Promise<BatchCreateUploadResponse> {
  const response = await apiClient.post<BatchCreateUploadResponse>(
    "/api/v1/files/upload/batch",
    request,
  );
  return response.data;
}

/**
 * 단일 업로드 완료 확인
 * POST /api/v1/files/upload/{upload_id}/complete
 */
export async function completeUpload(
  uploadId: string,
): Promise<UploadCompleteResponse> {
  const response = await apiClient.post<UploadCompleteResponse>(
    `/api/v1/files/upload/${uploadId}/complete`,
  );
  return response.data;
}

/**
 * 배치 업로드 완료 확인
 * POST /api/v1/files/upload/batch/complete
 */
export async function batchCompleteUploads(
  request: BatchCompleteRequest,
): Promise<BatchCompleteResponse> {
  const response = await apiClient.post<BatchCompleteResponse>(
    "/api/v1/files/upload/batch/complete",
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
