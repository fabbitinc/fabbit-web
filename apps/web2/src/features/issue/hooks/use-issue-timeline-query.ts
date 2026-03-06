import { useQuery } from "@tanstack/react-query";
import { issueQueries } from "@/features/issue/api/issue.queries";

export function useIssueTimelineQuery(issueNumber: number, enabled = true) {
  return useQuery({
    ...issueQueries.timeline(issueNumber),
    enabled,
  });
}
