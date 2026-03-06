import type { QueryClient } from "@tanstack/react-query";
import { issueKeys } from "@/features/issue/api/issue.queries";

interface InvalidateIssueQueriesOptions {
  includeList?: boolean;
}

export async function invalidateIssueQueries(
  queryClient: QueryClient,
  issueNumber: number,
  options?: InvalidateIssueQueriesOptions,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueNumber) }),
    queryClient.invalidateQueries({ queryKey: issueKeys.timeline(issueNumber) }),
    options?.includeList
      ? queryClient.invalidateQueries({ queryKey: ["change-management"] })
      : Promise.resolve(),
  ]);
}
