import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProjectLabels,
  createProjectLabel,
  updateProjectLabel,
  deleteProjectLabel,
  getTenantLabels,
  createTenantLabel,
  updateTenantLabel,
  deleteTenantLabel,
} from "../label";
import type { CreateLabelRequest, UpdateLabelRequest } from "../types";

export const PROJECT_LABELS_QUERY_KEY = ["projectLabels"] as const;

/** 프로젝트 라벨 목록 조회 훅 */
export function useProjectLabels(projectId: string) {
  return useQuery({
    queryKey: [...PROJECT_LABELS_QUERY_KEY, projectId],
    queryFn: () => getProjectLabels(projectId),
  });
}

/** 프로젝트 라벨 생성 뮤테이션 */
export function useCreateProjectLabel(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateLabelRequest) => createProjectLabel(projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_LABELS_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("라벨 생성에 실패했습니다");
    },
  });
}

/** 프로젝트 라벨 수정 뮤테이션 */
export function useUpdateProjectLabel(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ labelId, request }: { labelId: string; request: UpdateLabelRequest }) =>
      updateProjectLabel(projectId, labelId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_LABELS_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("라벨 수정에 실패했습니다");
    },
  });
}

/** 프로젝트 라벨 삭제 뮤테이션 */
export function useDeleteProjectLabel(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => deleteProjectLabel(projectId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_LABELS_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("라벨 삭제에 실패했습니다");
    },
  });
}

// --- 테넌트 레벨 라벨 훅 ---

export const TENANT_LABELS_QUERY_KEY = ["tenantLabels"] as const;

/** 테넌트 라벨 목록 조회 훅 */
export function useTenantLabels(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...TENANT_LABELS_QUERY_KEY],
    queryFn: getTenantLabels,
    enabled: options?.enabled,
  });
}

/** 테넌트 라벨 생성 뮤테이션 */
export function useCreateTenantLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateLabelRequest) => createTenantLabel(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TENANT_LABELS_QUERY_KEY] });
    },
    onError: () => {
      toast.error("라벨 생성에 실패했습니다");
    },
  });
}

/** 테넌트 라벨 수정 뮤테이션 */
export function useUpdateTenantLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ labelId, request }: { labelId: string; request: UpdateLabelRequest }) =>
      updateTenantLabel(labelId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TENANT_LABELS_QUERY_KEY] });
    },
    onError: () => {
      toast.error("라벨 수정에 실패했습니다");
    },
  });
}

/** 테넌트 라벨 삭제 뮤테이션 */
export function useDeleteTenantLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => deleteTenantLabel(labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TENANT_LABELS_QUERY_KEY] });
    },
    onError: () => {
      toast.error("라벨 삭제에 실패했습니다");
    },
  });
}
