import type { QueryClient } from "@tanstack/react-query";
import { engineeringChangeKeys } from "@/features/engineering-change/api/engineering-change.queries";

interface InvalidateEngineeringChangeQueriesOptions {
  includeList?: boolean;
}

export async function invalidateEngineeringChangeQueries(
  queryClient: QueryClient,
  engineeringChangeId: string,
  options?: InvalidateEngineeringChangeQueriesOptions,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: engineeringChangeKeys.detail(engineeringChangeId) }),
    queryClient.invalidateQueries({ queryKey: engineeringChangeKeys.timeline(engineeringChangeId) }),
    options?.includeList
      ? queryClient.invalidateQueries({ queryKey: ["change-management"] })
      : Promise.resolve(),
  ]);
}
