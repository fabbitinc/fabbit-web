import { queryOptions } from "@tanstack/react-query";
import {
  fetchChangeRequestList,
  fetchIssueList,
} from "@/features/change-management/api/change-management.api";
import type {
  ChangeRequestListQueryDto,
  IssueListQueryDto,
} from "@/features/change-management/api/change-management.types";

export const changeManagementKeys = {
  all: ["change-management"] as const,
  issuesAll: ["change-management", "issues"] as const,
  requestsAll: ["change-management", "requests"] as const,
  issues: (query: IssueListQueryDto) => ["change-management", "issues", query] as const,
  requests: (query: ChangeRequestListQueryDto) => ["change-management", "requests", query] as const,
};

export const changeManagementQueries = {
  issues: (query: IssueListQueryDto) =>
    queryOptions({
      queryKey: changeManagementKeys.issues(query),
      queryFn: () => fetchIssueList(query),
      staleTime: 30_000,
    }),
  requests: (query: ChangeRequestListQueryDto) =>
    queryOptions({
      queryKey: changeManagementKeys.requests(query),
      queryFn: () => fetchChangeRequestList(query),
      staleTime: 30_000,
    }),
};
