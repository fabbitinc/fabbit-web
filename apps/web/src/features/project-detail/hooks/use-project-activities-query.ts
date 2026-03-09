import { useQuery } from "@tanstack/react-query";
import { projectDetailQueries } from "@/features/project-detail/api/project-detail.queries";
import type { ProjectActivitiesQueryDto } from "@/features/project-detail/api/project-detail.types";

export function useProjectActivitiesQuery(projectId: string, query: ProjectActivitiesQueryDto, enabled = true) {
  return useQuery({
    ...projectDetailQueries.activities(projectId, query),
    enabled,
  });
}
