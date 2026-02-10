// POST /api/v1/files/temp/presigned-url
// POST /api/v1/files/presigned-url

export interface GeneratePresignedUrlRequest {
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  fileKey: string;
}
