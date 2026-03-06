import { apiClient } from "@/api/client";
import type {
  NodeSearchQueryDto,
  NodeSearchResponseDto,
  SynthesisBatchStartResponseDto,
  SynthesisBatchStatusResponseDto,
  SynthesisStartRequestDto,
} from "@/features/parts/api/parts-upload.types";
import type {
  PartsUploadBatchFailureModel,
  PartsUploadBatchItemStatusModel,
  PartsUploadBatchStartModel,
  PartsUploadBatchStatusModel,
  PartsUploadNodeSearchItemModel,
} from "@/features/parts/types/parts-upload-model";

export async function startPartsSynthesis(request: SynthesisStartRequestDto): Promise<PartsUploadBatchStartModel> {
  const response = await apiClient.post<SynthesisBatchStartResponseDto>("/api/v1/synthesis", request);
  return toPartsUploadBatchStartModel(response.data);
}

export async function fetchPartsUploadBatchStatus(batchId: string): Promise<PartsUploadBatchStatusModel> {
  const response = await apiClient.get<SynthesisBatchStatusResponseDto>(`/api/v1/synthesis/batches/${batchId}`);
  return toPartsUploadBatchStatusModel(response.data);
}

export async function searchPartsUploadNodes(
  query: NodeSearchQueryDto,
): Promise<PartsUploadNodeSearchItemModel[]> {
  const response = await apiClient.get<NodeSearchResponseDto>("/api/v1/ontology/nodes/search", {
    params: query,
  });

  return response.data.items.map((item) => ({
    value: item.value,
    label: item.label ?? null,
  }));
}

function toPartsUploadBatchStartModel(response: SynthesisBatchStartResponseDto): PartsUploadBatchStartModel {
  return {
    batchId: response.batch_id,
    requestedCount: response.requested_count,
    acceptedCount: response.accepted_count,
    failed: response.failed.map(toPartsUploadBatchFailureModel),
  };
}

function toPartsUploadBatchStatusModel(response: SynthesisBatchStatusResponseDto): PartsUploadBatchStatusModel {
  return {
    batchId: response.batch_id,
    requestedCount: response.requested_count,
    acceptedCount: response.accepted_count,
    failedCount: response.failed_count,
    pendingCount: response.pending_count,
    processingCount: response.processing_count,
    completedCount: response.completed_count,
    failedJobCount: response.failed_job_count,
    status: response.status,
    failed: response.failed.map(toPartsUploadBatchFailureModel),
    items: response.items.map(toPartsUploadBatchItemStatusModel),
    createdAt: response.created_at,
  };
}

function toPartsUploadBatchFailureModel(
  response: SynthesisBatchStartResponseDto["failed"][number] | SynthesisBatchStatusResponseDto["failed"][number],
): PartsUploadBatchFailureModel {
  return {
    fileId: response.file_id,
    reason: response.reason,
  };
}

function toPartsUploadBatchItemStatusModel(
  response: SynthesisBatchStatusResponseDto["items"][number],
): PartsUploadBatchItemStatusModel {
  return {
    jobId: response.job_id,
    fileId: response.file_id,
    status: response.status,
    totalRows: response.total_rows,
    processedRows: response.processed_rows,
    nodesCreated: response.nodes_created,
    relationshipsCreated: response.relationships_created,
    errorCount: response.error_count,
    startedAt: response.started_at,
    completedAt: response.completed_at,
  };
}
