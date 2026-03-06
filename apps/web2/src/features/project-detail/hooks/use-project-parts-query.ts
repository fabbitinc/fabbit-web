import { useQuery } from "@tanstack/react-query";
import { projectDetailQueries } from "@/features/project-detail/api/project-detail.queries";
import type { ProjectPartsQueryDto } from "@/features/project-detail/api/project-detail.types";

export function useProjectPartsQuery(projectId: string, query: ProjectPartsQueryDto, enabled = true) {
  return useQuery({
    ...projectDetailQueries.parts(projectId, query),
    enabled,
  });
}
