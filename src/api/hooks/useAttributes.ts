import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  batchCreateAttributes,
  bulkSaveDefinitions,
} from "../attribute";
import type {
  CreateAttributeRequest,
  UpdateAttributeRequest,
  BatchCreateAttributeRequest,
  BulkSaveDefinitionsRequest,
} from "../types";

export const ATTRIBUTES_QUERY_KEY = ["attributes"] as const;

/**
 * 프로젝트 속성 목록 조회 훅
 */
export function useAttributes(projectId: string | null) {
  return useQuery({
    queryKey: [...ATTRIBUTES_QUERY_KEY, projectId],
    queryFn: () => getAttributes(projectId!),
    enabled: !!projectId,
  });
}

/**
 * 속성 생성 뮤테이션
 */
export function useCreateAttribute(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateAttributeRequest) =>
      createAttribute(projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...ATTRIBUTES_QUERY_KEY, projectId],
      });
    },
  });
}

/**
 * 속성 수정 뮤테이션
 */
export function useUpdateAttribute(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attributeId,
      request,
    }: {
      attributeId: string;
      request: UpdateAttributeRequest;
    }) => updateAttribute(projectId, attributeId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...ATTRIBUTES_QUERY_KEY, projectId],
      });
    },
  });
}

/**
 * 속성 삭제 뮤테이션
 */
export function useDeleteAttribute(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attributeId: string) =>
      deleteAttribute(projectId, attributeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...ATTRIBUTES_QUERY_KEY, projectId],
      });
    },
  });
}


/**
 * 속성 정의 일괄 저장 뮤테이션
 * PUT /api/v1/projects/:projectId/attributes/definitions
 */
export function useBulkSaveDefinitions(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: BulkSaveDefinitionsRequest) =>
      bulkSaveDefinitions(projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...ATTRIBUTES_QUERY_KEY, projectId],
      });
    },
  });
}

/**
 * 속성 일괄 생성 뮤테이션
 */
export function useBatchCreateAttributes(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: BatchCreateAttributeRequest) =>
      batchCreateAttributes(projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...ATTRIBUTES_QUERY_KEY, projectId],
      });
    },
  });
}
