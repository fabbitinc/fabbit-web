import type { TreeNodeData } from "@/features/items/types";
import type { ProjectDto } from "../types";

/**
 * API ProjectDto를 UI TreeNodeData(project) 형식으로 변환
 *
 * API에서 제공하는 필드:
 * - id, name, description, color, status, createdAt, updatedAt
 *
 * API에 없어서 기본값으로 처리되는 필드:
 * - itemCount: undefined (프로젝트 목록 API에서는 미제공)
 */
function convertProjectDto(project: ProjectDto): TreeNodeData {
  return {
    id: project.id,
    name: project.name,
    type: "project",
    description: project.description ?? undefined,
    lastUpdated: project.updatedAt,
  };
}

/**
 * ProjectListResponse를 TreeNodeData[] 배열로 변환
 */
export function convertProjectListResponse(
  response: ProjectDto[],
): TreeNodeData[] {
  return response.map(convertProjectDto);
}
