// POST /api/v1/files/upload

export interface CreateFileRequest {
  original_name: string;
  content_type: string;
  file_size: number;
  owner_type?: string | null;
  owner_id?: string | null;
}

export interface CreateFileResponse {
  file_id: string;
  upload_url: string;
  file_key: string;
}

// POST /api/v1/files/upload/batch

export interface BatchCreateFilesRequest {
  items: CreateFileRequest[];
}

export interface BatchCreateFilesResponse {
  items: CreateFileResponse[];
}

// POST /api/v1/files/upload/{file_id}/complete

export interface FileCompleteResponse {
  file_id: string;
  status: string;
  original_name: string;
  file_key: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

// POST /api/v1/files/upload/batch/complete

export interface BatchCompleteFilesResponse {
  items: FileCompleteResponse[];
  failed: { file_id: string; reason: string }[];
}
