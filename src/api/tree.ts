import { apiClient } from "./client";
import type { ProjectTreeResponse } from "./types";

/**
 * 프로젝트 트리 조회
 * GET /api/v1/projects/tree
 *
 * 프로젝트 > 폴더 > 아이템 트리 구조를 조회합니다
 */
export async function getProjectTree(): Promise<ProjectTreeResponse> {
  const response = await apiClient.get<ProjectTreeResponse>("/api/v1/projects/tree");
  return response.data;
}
