import type { QueryClient } from "@tanstack/react-query";
import { changeRequestKeys } from "@/features/change-request/api/change-request.queries";

interface InvalidateChangeRequestQueriesOptions {
  includeList?: boolean;
}

export async function invalidateChangeRequestQueries(
  queryClient: QueryClient,
  changeNumber: number,
  options?: InvalidateChangeRequestQueriesOptions,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: changeRequestKeys.detail(changeNumber) }),
    queryClient.invalidateQueries({ queryKey: changeRequestKeys.timeline(changeNumber) }),
    options?.includeList
      ? queryClient.invalidateQueries({ queryKey: ["change-management"] })
      : Promise.resolve(),
  ]);
}
