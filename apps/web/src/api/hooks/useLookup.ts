import { useQuery } from "@tanstack/react-query";
import {
  lookupOrgMembers,
  lookupLabels,
  lookupIssues,
  lookupParts,
  lookupChanges,
} from "../lookup";

const LOOKUP_MEMBERS_KEY = ["lookupMembers"] as const;
const LOOKUP_LABELS_KEY = ["lookupLabels"] as const;
const LOOKUP_ISSUES_KEY = ["lookupIssues"] as const;
const LOOKUP_PARTS_KEY = ["lookupParts"] as const;
const LOOKUP_CHANGES_KEY = ["lookupChanges"] as const;

/** 멤버 lookup 훅 (picker용, lazy fetch) */
export function useLookupMembers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...LOOKUP_MEMBERS_KEY],
    queryFn: () => lookupOrgMembers(),
    enabled: options?.enabled,
  });
}

/** 라벨 lookup 훅 (picker용, lazy fetch) */
export function useLookupLabels(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...LOOKUP_LABELS_KEY],
    queryFn: () => lookupLabels(),
    enabled: options?.enabled,
  });
}

/** 이슈 lookup 훅 (picker용, lazy fetch) */
export function useLookupIssues(options?: { enabled?: boolean; type?: "ISSUE" | "CHANGE_REQUEST" }) {
  return useQuery({
    queryKey: [...LOOKUP_ISSUES_KEY, options?.type],
    queryFn: () => lookupIssues(undefined, undefined, options?.type),
    enabled: options?.enabled,
  });
}

/** 부품 lookup 훅 (picker용, 검색 지원) */
export function useLookupParts(
  search: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...LOOKUP_PARTS_KEY, search],
    queryFn: () => lookupParts(search || undefined),
    enabled: options?.enabled,
  });
}

/** 변경 요청 lookup 훅 (picker용, lazy fetch) */
export function useLookupChanges(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...LOOKUP_CHANGES_KEY],
    queryFn: () => lookupChanges(),
    enabled: options?.enabled,
  });
}
