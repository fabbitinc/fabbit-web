import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjects, getProject, updateProject } from "../project";
import { convertProjectListResponse } from "../adapters";
import { mockFolders } from "@/features/items/mock-data";
import type { UpdateProjectRequest } from "../types";

export const PROJECTS_QUERY_KEY = ["projects"] as const;
export const PROJECT_QUERY_KEY = ["project"] as const;

// Mock 프로젝트: mockFolders에서 type이 "project"인 항목만 필터링
const mockProjects = mockFolders.filter((folder) => folder.type === "project");

/**
 * 프로젝트 목록 조회 훅
 *
 * Mock 프로젝트와 실제 API 프로젝트를 분리하여 반환
 */
export function useProjects() {
  const query = useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: async () => {
      const response = await getProjects();
      return convertProjectListResponse(response);
    },
  });

  return {
    ...query,
    mockProjects,
    apiProjects: query.data ?? [],
  };
}

/**
 * 단일 프로젝트 조회 훅
 */
export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: [...PROJECT_QUERY_KEY, projectId],
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
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
      queryClient.invalidateQueries({ queryKey: [...PROJECT_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}
