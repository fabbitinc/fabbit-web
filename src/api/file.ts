import { apiClient } from "./client";
import type {
  CreateFileRequest,
  CreateFileResponse,
  FileCompleteResponse,
} from "./types/file";

/** 파일 업로드 presigned URL 발급 */
export async function createFileUpload(
  request: CreateFileRequest,
): Promise<CreateFileResponse> {
  const response = await apiClient.post<CreateFileResponse>(
    "/api/v1/files/upload",
    request,
  );
  return response.data;
}

/**
 * Presigned URL로 파일 업로드
 * @param uploadUrl presigned URL
 * @param file 업로드할 파일
 * @param contentType presigned URL 서명에 사용된 Content-Type
 */
export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });
}

/** 파일 업로드 완료 확인 */
export async function completeFileUpload(
  fileId: string,
): Promise<FileCompleteResponse> {
  const response = await apiClient.post<FileCompleteResponse>(
    `/api/v1/files/upload/${fileId}/complete`,
  );
  return response.data;
}
