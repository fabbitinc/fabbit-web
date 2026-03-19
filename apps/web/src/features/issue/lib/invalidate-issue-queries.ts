import type { QueryClient } from "@tanstack/react-query";
import { issueKeys } from "@/features/issue/api/issue.queries";

interface InvalidateIssueQueriesOptions {
  includeList?: boolean;
}

export async function invalidateIssueQueries(
  queryClient: QueryClient,
  issueId: string,
  options?: InvalidateIssueQueriesOptions,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) }),
    queryClient.invalidateQueries({ queryKey: issueKeys.timeline(issueId) }),
    options?.includeList
      ? queryClient.invalidateQueries({ queryKey: ["change-management"] })
      : Promise.resolve(),
  ]);
}
