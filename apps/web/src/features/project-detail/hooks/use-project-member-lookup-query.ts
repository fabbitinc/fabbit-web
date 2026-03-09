import { useQuery } from "@tanstack/react-query";
import { projectDetailQueries } from "@/features/project-detail/api/project-detail.queries";
import type { ProjectMemberLookupQueryDto } from "@/features/project-detail/api/project-detail.types";

export function useProjectMemberLookupQuery(projectId: string, query: ProjectMemberLookupQueryDto, enabled: boolean) {
  return useQuery({
    ...projectDetailQueries.memberLookup(projectId, query),
    enabled,
  });
}
