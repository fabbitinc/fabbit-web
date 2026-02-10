import { useQuery } from "@tanstack/react-query";
import { getProjectTree } from "../tree";
import { convertProjectTreeResponse } from "../adapters";
import { mockProject } from "@/features/items/mock-data";

export const PROJECT_TREE_QUERY_KEY = ["projectTree"] as const;

/**
 * 프로젝트 트리 조회 훅
 *
 * @returns TreeNodeData[] 형식의 프로젝트 트리
 *
 * [필드 누락 안내]
 * API에 없어서 기본값으로 처리되는 필드:
 * - Project: description, lastUpdated
 * - Folder: itemCount (하위 items 배열 길이로 계산)
 * - Item: status, hasDrawing
 *
 * [Mock 프로젝트]
 * UI 설계 확인을 위해 mockProject가 항상 첫 번째로 포함됨
 */
export function useProjectTree() {
  return useQuery({
    queryKey: PROJECT_TREE_QUERY_KEY,
    queryFn: async () => {
      const response = await getProjectTree();
      const apiProjects = convertProjectTreeResponse(response);
      // Mock 프로젝트를 항상 첫 번째로 포함 (UI 설계 확인용)
      return [mockProject, ...apiProjects];
    },
  });
}
