import { useQuery } from "@tanstack/react-query";
import { projectDetailQueries } from "@/features/project-detail/api/project-detail.queries";
import type { ProjectPartLookupQueryDto } from "@/features/project-detail/api/project-detail.types";

export function useProjectPartLookupQuery(projectId: string, query: ProjectPartLookupQueryDto, enabled: boolean) {
  return useQuery({
    ...projectDetailQueries.partLookup(projectId, query),
    enabled,
  });
}
