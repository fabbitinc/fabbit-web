import { useQuery } from "@tanstack/react-query";
import { issueQueries } from "@/features/issue/api/issue.queries";

export function useIssueDetailQuery(issueNumber: number, enabled = true) {
  return useQuery({
    ...issueQueries.detail(issueNumber),
    enabled,
  });
}
