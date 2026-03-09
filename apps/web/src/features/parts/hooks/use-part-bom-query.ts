import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartBomQuery(partId: string, enabled = true) {
  return useQuery({
    ...partsQueries.bom(partId),
    enabled,
  });
}
