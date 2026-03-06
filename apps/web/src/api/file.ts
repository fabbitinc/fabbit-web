import { apiClient } from "./client";
import type {
  CreateFileRequest,
  CreateFileResponse,
  FileCompleteResponse,
  BatchCreateFilesResponse,
  BatchCompleteFilesResponse,
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

/** 배치 파일 업로드 presigned URL 발급 */
export async function batchCreateFileUpload(
  items: CreateFileRequest[],
): Promise<BatchCreateFilesResponse> {
  const response = await apiClient.post<BatchCreateFilesResponse>(
    "/api/v1/files/upload/batch",
    { items },
  );
  return response.data;
}

/** 배치 파일 업로드 완료 확인 */
export async function batchCompleteFileUpload(
  fileIds: string[],
): Promise<BatchCompleteFilesResponse> {
  const response = await apiClient.post<BatchCompleteFilesResponse>(
    "/api/v1/files/upload/batch/complete",
    { file_ids: fileIds },
  );
  return response.data;
}

/**
 * 파일 목록 업로드 후 file_id 배열을 반환
 * - 1건: 단일 업로드 API 사용
 * - 2건 이상: batch 업로드 API 사용
 */
export async function uploadFiles(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  // 단건 업로드
  if (files.length === 1) {
    const [file] = files;
    const contentType = file.type || "application/octet-stream";
    const { file_id, upload_url } = await createFileUpload({
      original_name: file.name,
      content_type: contentType,
      file_size: file.size,
    });

    await uploadFileToPresignedUrl(upload_url, file, contentType);
    await completeFileUpload(file_id);
    return [file_id];
  }

  // 다건 업로드: 1. batch presigned URL 발급
  const { items } = await batchCreateFileUpload(
    files.map((file) => ({
      original_name: file.name,
      content_type: file.type || "application/octet-stream",
      file_size: file.size,
    })),
  );

  // 2. presigned URL로 병렬 업로드
  await Promise.all(
    items.map((item, i) =>
      uploadFileToPresignedUrl(
        item.upload_url,
        files[i],
        files[i].type || "application/octet-stream",
      ),
    ),
  );

  // 3. batch 완료 확인
  const fileIds = items.map((item) => item.file_id);
  await batchCompleteFileUpload(fileIds);

  return fileIds;
}
