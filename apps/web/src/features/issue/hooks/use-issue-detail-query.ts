import { useQuery } from "@tanstack/react-query";
import { issueQueries } from "@/features/issue/api/issue.queries";

export function useIssueDetailQuery(issueId: string, enabled = true) {
  return useQuery({
    ...issueQueries.detail(issueId),
    enabled,
  });
}
