import { apiClient } from "@/api/client";
import type {
  BatchCompleteFileRequestDto,
  BatchCompleteFileResponseDto,
  BatchCreateFileRequestDto,
  BatchCreateFileResponseDto,
  CreateFileRequestDto,
  CreateFileResponseDto,
  FileCompleteResponseDto,
} from "@/api/file.types";

export async function createFileUpload(request: CreateFileRequestDto) {
  const response = await apiClient.post<CreateFileResponseDto>("/api/v1/files/upload", request);
  return response.data;
}

export async function batchCreateFileUpload(items: CreateFileRequestDto[]) {
  const request: BatchCreateFileRequestDto = { items };
  const response = await apiClient.post<BatchCreateFileResponseDto>("/api/v1/files/upload/batch", request);
  return response.data;
}

export async function completeFileUpload(fileId: string) {
  const response = await apiClient.post<FileCompleteResponseDto>(`/api/v1/files/upload/${fileId}/complete`);
  return response.data;
}

export async function batchCompleteFileUpload(fileIds: string[]) {
  const request: BatchCompleteFileRequestDto = { file_ids: fileIds };
  const response = await apiClient.post<BatchCompleteFileResponseDto>(
    "/api/v1/files/upload/batch/complete",
    request,
  );
  return response.data;
}

export async function uploadFileToPresignedUrl(uploadUrl: string, file: File, contentType: string) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    throw new Error("파일 업로드에 실패했습니다.");
  }
}

export async function uploadSingleFile(file: File) {
  const contentType = file.type || "application/octet-stream";
  const created = await createFileUpload({
    original_name: file.name,
    content_type: contentType,
    file_size: file.size,
  });

  await uploadFileToPresignedUrl(created.upload_url, file, contentType);
  await completeFileUpload(created.file_id);

  return created.file_id;
}

export async function uploadFiles(files: File[]) {
  if (files.length === 0) {
    return [];
  }

  if (files.length === 1) {
    return [await uploadSingleFile(files[0])];
  }

  const created = await batchCreateFileUpload(
    files.map((file) => ({
      original_name: file.name,
      content_type: file.type || "application/octet-stream",
      file_size: file.size,
    })),
  );

  await Promise.all(
    created.items.map((item, index) =>
      uploadFileToPresignedUrl(
        item.upload_url,
        files[index],
        files[index].type || "application/octet-stream",
      ),
    ),
  );

  const fileIds = created.items.map((item) => item.file_id);
  await batchCompleteFileUpload(fileIds);

  return fileIds;
}
