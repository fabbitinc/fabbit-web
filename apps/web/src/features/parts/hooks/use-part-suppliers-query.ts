import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartSuppliersQuery(partId: string, enabled = true) {
  return useQuery({
    ...partsQueries.suppliers(partId),
    enabled,
  });
}
