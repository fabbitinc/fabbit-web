// ─── Synthesis ───

export interface SynthesisUploadItem {
  file_id: string;
  root_context?: Record<string, string> | null;
}

export interface SynthesisStartRequest {
  mapping_id?: string | null;
  project_id?: string | null;
  overwrite?: boolean;
  uploads: SynthesisUploadItem[];
}

export interface SynthesisJobResponse {
  id: string;
  mapping_id: string;
  file_id: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  nodes_created: number;
  relationships_created: number;
  errors: string[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface SynthesisBatchFailure {
  file_id: string;
  reason: string;
}

export interface SynthesisBatchStartResponse {
  batch_id: string;
  requested_count: number;
  accepted_count: number;
  items: SynthesisJobResponse[];
  failed: SynthesisBatchFailure[];
}

export interface SynthesisBatchItemStatus {
  job_id: string;
  file_id: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  nodes_created: number;
  relationships_created: number;
  error_count: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface SynthesisBatchStatusResponse {
  batch_id: string;
  requested_count: number;
  accepted_count: number;
  failed_count: number;
  pending_count: number;
  processing_count: number;
  completed_count: number;
  failed_job_count: number;
  status: string;
  failed: SynthesisBatchFailure[];
  items: SynthesisBatchItemStatus[];
  created_at: string;
}

export interface SynthesisListResponse {
  items: SynthesisJobResponse[];
}
