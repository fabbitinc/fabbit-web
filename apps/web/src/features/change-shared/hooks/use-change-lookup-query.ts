import { useQuery } from "@tanstack/react-query";
import { changeSharedQueries } from "@/features/change-shared/api/change-shared.queries";
import type { ChangeLookupQueryDto } from "@/features/change-shared/api/change-shared.types";

export function useChangeLookupQuery(query: ChangeLookupQueryDto, enabled: boolean) {
  return useQuery({
    ...changeSharedQueries.changes(query),
    enabled,
  });
}
