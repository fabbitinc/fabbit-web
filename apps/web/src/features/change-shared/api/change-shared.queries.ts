import { queryOptions } from "@tanstack/react-query";
import {
  lookupChanges,
  lookupIssues,
  lookupLabels,
  lookupMembers,
  lookupPartRevisions,
  lookupParts,
} from "@/features/change-shared/api/change-shared.api";
import type {
  ChangeLookupQueryDto,
  IssueLookupQueryDto,
  LabelLookupQueryDto,
  MemberLookupQueryDto,
  PartLookupQueryDto,
  PartRevisionLookupQueryDto,
} from "@/features/change-shared/api/change-shared.types";

export const changeSharedQueries = {
  members: (query: MemberLookupQueryDto) =>
    queryOptions({
      queryKey: ["change-shared", "members", query],
      queryFn: () => lookupMembers(query),
      staleTime: 10_000,
    }),
  labels: (query: LabelLookupQueryDto) =>
    queryOptions({
      queryKey: ["change-shared", "labels", query],
      queryFn: () => lookupLabels(query),
      staleTime: 10_000,
    }),
  parts: (query: PartLookupQueryDto) =>
    queryOptions({
      queryKey: ["change-shared", "parts", query],
      queryFn: () => lookupParts(query),
      staleTime: 10_000,
    }),
  partRevisions: (query: PartRevisionLookupQueryDto) =>
    queryOptions({
      queryKey: ["change-shared", "part-revisions", query],
      queryFn: () => lookupPartRevisions(query),
      staleTime: 10_000,
    }),
  issues: (query: IssueLookupQueryDto) =>
    queryOptions({
      queryKey: ["change-shared", "issues", query],
      queryFn: () => lookupIssues(query),
      staleTime: 10_000,
    }),
  changes: (query: ChangeLookupQueryDto) =>
    queryOptions({
      queryKey: ["change-shared", "changes", query],
      queryFn: () => lookupChanges(query),
      staleTime: 10_000,
    }),
};
