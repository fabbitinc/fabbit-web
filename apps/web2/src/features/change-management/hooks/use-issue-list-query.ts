import { useQuery } from "@tanstack/react-query";
import { changeManagementQueries } from "@/features/change-management/api/change-management.queries";
import type { IssueListQueryDto } from "@/features/change-management/api/change-management.types";

export function useIssueListQuery(query: IssueListQueryDto, enabled = true) {
  return useQuery({
    ...changeManagementQueries.issues(query),
    enabled,
  });
}
