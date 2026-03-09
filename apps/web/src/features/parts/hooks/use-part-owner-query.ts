import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartOwnerQuery(partId: string, enabled = true) {
  return useQuery({
    ...partsQueries.owner(partId),
    enabled,
  });
}
