import { useQuery } from "@tanstack/react-query";
import { projectDetailQueries } from "@/features/project-detail/api/project-detail.queries";

export function useProjectIssuesQuery(projectId: string, enabled = true) {
  return useQuery({
    ...projectDetailQueries.issues(projectId),
    enabled,
  });
}
