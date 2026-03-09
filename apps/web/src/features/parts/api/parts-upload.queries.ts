import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  fetchPartsUploadBatchStatus,
  searchPartsUploadNodes,
  startPartsSynthesis,
} from "@/features/parts/api/parts-upload.api";
import type { NodeSearchQueryDto, SynthesisStartRequestDto } from "@/features/parts/api/parts-upload.types";

export const partsUploadKeys = {
  all: ["parts", "upload"] as const,
  batchStatus: (batchId: string) => ["parts", "upload", "batch-status", batchId] as const,
  nodeSearch: (query: NodeSearchQueryDto) => ["parts", "upload", "node-search", query.label, query.search] as const,
};

export const partsUploadQueries = {
  batchStatus: (batchId: string) =>
    queryOptions({
      queryKey: partsUploadKeys.batchStatus(batchId),
      queryFn: () => fetchPartsUploadBatchStatus(batchId),
      staleTime: 0,
      gcTime: 5 * 60_000,
    }),
  nodeSearch: (query: NodeSearchQueryDto) =>
    queryOptions({
      queryKey: partsUploadKeys.nodeSearch(query),
      queryFn: () => searchPartsUploadNodes(query),
      staleTime: 30_000,
    }),
};

export const partsUploadMutations = {
  startSynthesis: () =>
    mutationOptions({
      mutationKey: ["parts", "upload", "start-synthesis"],
      mutationFn: (request: SynthesisStartRequestDto) => startPartsSynthesis(request),
    }),
};
