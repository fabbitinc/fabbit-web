import { useQuery } from "@tanstack/react-query";
import { issueQueries } from "@/features/issue/api/issue.queries";

export function useIssueTimelineQuery(issueId: string, enabled = true) {
  return useQuery({
    ...issueQueries.timeline(issueId),
    enabled,
  });
}
