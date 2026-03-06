import { useQuery } from "@tanstack/react-query";
import { projectDetailQueries } from "@/features/project-detail/api/project-detail.queries";

export function useProjectMembersQuery(projectId: string, enabled = true) {
  return useQuery({
    ...projectDetailQueries.members(projectId),
    enabled,
  });
}
