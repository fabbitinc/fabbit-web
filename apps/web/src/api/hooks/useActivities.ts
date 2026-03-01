import { useInfiniteQuery } from "@tanstack/react-query";
import { getProjectActivities } from "../activity";
import type { ActivityScope } from "../types";

export const PROJECT_ACTIVITIES_QUERY_KEY = ["projectActivities"] as const;

export function useProjectActivities(
  projectId: string | undefined,
  options?: { scope?: ActivityScope[]; limit?: number },
) {
  return useInfiniteQuery({
    queryKey: [...PROJECT_ACTIVITIES_QUERY_KEY, projectId, options?.scope, options?.limit],
    queryFn: ({ pageParam }) =>
      getProjectActivities(projectId!, {
        cursor: pageParam ?? undefined,
        limit: options?.limit,
        scope: options?.scope,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!projectId,
  });
}
