import { useQuery } from "@tanstack/react-query";
import { changeSharedQueries } from "@/features/change-shared/api/change-shared.queries";
import type { IssueLookupQueryDto } from "@/features/change-shared/api/change-shared.types";

export function useIssueLookupQuery(query: IssueLookupQueryDto, enabled: boolean) {
  return useQuery({
    ...changeSharedQueries.issues(query),
    enabled,
  });
}
