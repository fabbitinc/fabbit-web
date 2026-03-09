import { useQuery } from "@tanstack/react-query";
import { changeSharedQueries } from "@/features/change-shared/api/change-shared.queries";
import type { LabelLookupQueryDto } from "@/features/change-shared/api/change-shared.types";

export function useLabelLookupQuery(query: LabelLookupQueryDto, enabled: boolean) {
  return useQuery({
    ...changeSharedQueries.labels(query),
    enabled,
  });
}
