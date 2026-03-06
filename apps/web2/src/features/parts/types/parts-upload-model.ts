export type PartsUploadFileStatus = "validating" | "completed" | "failed";

export interface PartsUploadFileModel {
  id: string;
  name: string;
  size: number;
  file: File;
  status: PartsUploadFileStatus;
  uploadId?: string;
  error?: string;
  extraColumns?: string[];
  rootContext?: Record<string, string>;
}

export interface PartsUploadBatchFailureModel {
  fileId: string;
  reason: string;
}

export interface PartsUploadBatchItemStatusModel {
  jobId: string;
  fileId: string;
  status: string;
  totalRows: number;
  processedRows: number;
  nodesCreated: number;
  relationshipsCreated: number;
  errorCount: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface PartsUploadBatchStartModel {
  batchId: string;
  requestedCount: number;
  acceptedCount: number;
  failed: PartsUploadBatchFailureModel[];
}

export interface PartsUploadBatchStatusModel {
  batchId: string;
  requestedCount: number;
  acceptedCount: number;
  failedCount: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedJobCount: number;
  status: string;
  failed: PartsUploadBatchFailureModel[];
  items: PartsUploadBatchItemStatusModel[];
  createdAt: string;
}

export interface PartsUploadBatchSessionModel extends PartsUploadBatchStartModel {
  fileNames: Record<string, string>;
}

export interface PartsUploadNodeSearchItemModel {
  value: string;
  label: string | null;
}
