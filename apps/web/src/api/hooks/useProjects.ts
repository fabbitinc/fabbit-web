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
  getProjectMembers,
  addProjectMembers,
  removeProjectMembers,
} from "../project";
import type { CreateProjectRequest, ListProjectsParams, UpdateProjectRequest } from "../types";

export const PROJECTS_QUERY_KEY = ["projects"] as const;
export const PROJECT_QUERY_KEY = ["project"] as const;
export const PROJECT_PARTS_QUERY_KEY = ["projectParts"] as const;
export const PROJECT_MEMBERS_QUERY_KEY = ["projectMembers"] as const;

/**
 * 프로젝트 목록 조회 훅
 */
export function useProjects(params?: ListProjectsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, params],
    queryFn: () => getProjects(params),
    enabled: options?.enabled,
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

/** 프로젝트 부품 검색 훅 (디바운스된 검색어로 호출) */
export function useSearchProjectParts(projectId: string | undefined, search: string, enabled = true) {
  return useQuery({
    queryKey: [...PROJECT_PARTS_QUERY_KEY, projectId, "search", search],
    queryFn: () => getProjectParts(projectId!, search || undefined),
    enabled: !!projectId && enabled,
    placeholderData: (prev) => prev,
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

/** 프로젝트 멤버 목록 조회 훅 */
export function useProjectMembers(projectId: string, enabled = true) {
  return useQuery({
    queryKey: [...PROJECT_MEMBERS_QUERY_KEY, projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled,
  });
}

/** 프로젝트에 멤버 추가 뮤테이션 */
export function useAddProjectMembers(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userIds, role }: { userIds: string[]; role?: import("@/api/types").ProjectRole }) => addProjectMembers(projectId, userIds, role),
    onSuccess: (data) => {
      toast.success(`${data.count}명의 사용자를 추가했습니다`);
      queryClient.invalidateQueries({ queryKey: [...PROJECT_MEMBERS_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("사용자 추가에 실패했습니다");
    },
  });
}

/** 프로젝트에서 멤버 제거 뮤테이션 */
export function useRemoveProjectMembers(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => removeProjectMembers(projectId, userIds),
    onSuccess: () => {
      toast.success("사용자를 제거했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_MEMBERS_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("사용자 제거에 실패했습니다");
    },
  });
}
