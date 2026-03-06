import { useQuery } from "@tanstack/react-query";
import { changeSharedQueries } from "@/features/change-shared/api/change-shared.queries";
import type { PartLookupQueryDto } from "@/features/change-shared/api/change-shared.types";

export function usePartLookupQuery(query: PartLookupQueryDto, enabled: boolean) {
  return useQuery({
    ...changeSharedQueries.parts(query),
    enabled,
  });
}
