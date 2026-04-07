import { useQuery } from "@tanstack/react-query";
import { changeSharedQueries } from "@/features/change-shared/api/change-shared.queries";
import type { PartRevisionLookupQueryDto } from "@/features/change-shared/api/change-shared.types";

export function usePartRevisionLookupQuery(query: PartRevisionLookupQueryDto, enabled: boolean) {
  return useQuery({
    ...changeSharedQueries.partRevisions(query),
    enabled,
  });
}
