import { searchNodesApiV1OntologyNodesSearchGet } from "@/api/generated/orval/ontology/ontology";
import {
  getSynthesisBatchApiV1SynthesisBatchesBatchIdGet,
  startSynthesisApiV1SynthesisPost,
} from "@/api/generated/orval/synthesis/synthesis";
import type {
  NodeSearchQueryDto,
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
  const response = await startSynthesisApiV1SynthesisPost(request);
  return toPartsUploadBatchStartModel(response);
}

export async function fetchPartsUploadBatchStatus(batchId: string): Promise<PartsUploadBatchStatusModel> {
  const response = await getSynthesisBatchApiV1SynthesisBatchesBatchIdGet(batchId);
  return toPartsUploadBatchStatusModel(response);
}

export async function searchPartsUploadNodes(
  query: NodeSearchQueryDto,
): Promise<PartsUploadNodeSearchItemModel[]> {
  const response = await searchNodesApiV1OntologyNodesSearchGet(query);

  return response.items.map((item) => ({
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
