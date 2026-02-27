// ─── Upload ───

export interface CreateUploadRequest {
  original_name: string;
  content_type: string;
  file_size: number;
  owner_type?: string;
  owner_id?: string;
}

export interface CreateUploadResponse {
  file_id: string;
  upload_url: string;
  file_key: string;
}

export interface BatchCreateUploadRequest {
  items: CreateUploadRequest[];
}

export interface BatchCreateUploadResponse {
  items: CreateUploadResponse[];
}

export interface BatchCompleteRequest {
  file_ids: string[];
}

export interface UploadCompleteResponse {
  file_id: string;
  status: string;
  original_name: string;
  file_key: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

export interface BatchCompleteFailure {
  file_id: string;
  reason: string;
}

export interface BatchCompleteResponse {
  items: UploadCompleteResponse[];
  failed: BatchCompleteFailure[];
}
