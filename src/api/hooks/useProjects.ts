import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectParts,
  addPartToProject,
  removePartFromProject,
} from "../project";
import type { CreateProjectRequest, UpdateProjectRequest } from "../types";

export const PROJECTS_QUERY_KEY = ["projects"] as const;
export const PROJECT_QUERY_KEY = ["project"] as const;
export const PROJECT_PARTS_QUERY_KEY = ["projectParts"] as const;

/**
 * 프로젝트 목록 조회 훅
 */
export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: getProjects,
  });
}

/**
 * 단일 프로젝트 조회 훅
 */
export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: [...PROJECT_QUERY_KEY, projectId],
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
  });
}

/**
 * 프로젝트 생성 뮤테이션
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateProjectRequest) => createProject(request),
    onSuccess: () => {
      toast.success("프로젝트가 생성되었습니다");
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
    onError: () => {
      toast.error("프로젝트 생성에 실패했습니다");
    },
  });
}

/**
 * 프로젝트 수정 뮤테이션
 */
export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateProjectRequest) => updateProject(projectId, request),
    onSuccess: () => {
      toast.success("프로젝트가 수정되었습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
    onError: () => {
      toast.error("프로젝트 수정에 실패했습니다");
    },
  });
}

/**
 * 프로젝트 삭제 뮤테이션
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      toast.success("프로젝트가 삭제되었습니다");
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
    onError: () => {
      toast.error("프로젝트 삭제에 실패했습니다");
    },
  });
}

/**
 * 프로젝트 부품 목록 조회 훅
 */
export function useProjectParts(projectId: string | undefined) {
  return useQuery({
    queryKey: [...PROJECT_PARTS_QUERY_KEY, projectId],
    queryFn: () => getProjectParts(projectId!),
    enabled: !!projectId,
  });
}

/**
 * 프로젝트에 부품 연결 뮤테이션
 */
export function useAddPartToProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partId: string) => addPartToProject(projectId, partId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECT_PARTS_QUERY_KEY, projectId] });
    },
  });
}

/**
 * 프로젝트에서 부품 해제 뮤테이션
 */
export function useRemovePartFromProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partId: string) => removePartFromProject(projectId, partId),
    onSuccess: () => {
      toast.success("부품 연결이 해제되었습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_PARTS_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("부품 연결 해제에 실패했습니다");
    },
  });
}
