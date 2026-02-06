import { apiClient } from "./client";
import type { GeneratePresignedUrlRequest, PresignedUrlResponse } from "./types";

/**
 * 임시 파일 Presigned URL 생성
 * POST /api/v1/files/temp/presigned-url
 *
 * BOM 분석 등 임시 처리용 파일에 사용
 */
export async function generateTempPresignedUrl(
  request: GeneratePresignedUrlRequest
): Promise<PresignedUrlResponse> {
  const response = await apiClient.post<PresignedUrlResponse>(
    "/api/v1/files/temp/presigned-url",
    request
  );
  return response.data;
}

/**
 * Presigned URL 생성 (영구 저장용)
 * POST /api/v1/files/presigned-url
 */
export async function generatePresignedUrl(
  request: GeneratePresignedUrlRequest
): Promise<PresignedUrlResponse> {
  const response = await apiClient.post<PresignedUrlResponse>(
    "/api/v1/files/presigned-url",
    request
  );
  return response.data;
}

/**
 * Presigned URL로 파일 업로드
 * @param uploadUrl presigned URL
 * @param file 업로드할 파일
 */
export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  file: File
): Promise<void> {
  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
}
