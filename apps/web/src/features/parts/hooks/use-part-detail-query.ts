import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartDetailQuery(partId: string, revisionId: string, enabled = true) {
  return useQuery({
    ...partsQueries.detail(partId, revisionId),
    enabled,
  });
}
