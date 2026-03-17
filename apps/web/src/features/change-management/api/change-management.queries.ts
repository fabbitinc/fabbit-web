import { queryOptions } from "@tanstack/react-query";
import {
  fetchEngineeringChangeList,
  fetchIssueList,
} from "@/features/change-management/api/change-management.api";
import type {
  EngineeringChangeListQueryDto,
  IssueListQueryDto,
} from "@/features/change-management/api/change-management.types";

export const changeManagementKeys = {
  all: ["change-management"] as const,
  issuesAll: ["change-management", "issues"] as const,
  engineeringChangesAll: ["change-management", "engineering-changes"] as const,
  issues: (query: IssueListQueryDto) => ["change-management", "issues", query] as const,
  engineeringChanges: (query: EngineeringChangeListQueryDto) =>
    ["change-management", "engineering-changes", query] as const,
};

export const changeManagementQueries = {
  issues: (query: IssueListQueryDto) =>
    queryOptions({
      queryKey: changeManagementKeys.issues(query),
      queryFn: () => fetchIssueList(query),
      staleTime: 30_000,
    }),
  engineeringChanges: (query: EngineeringChangeListQueryDto) =>
    queryOptions({
      queryKey: changeManagementKeys.engineeringChanges(query),
      queryFn: () => fetchEngineeringChangeList(query),
      staleTime: 30_000,
    }),
};
