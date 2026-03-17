import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartHistoryQuery(partNumber: string, enabled = true) {
  return useQuery({
    ...partsQueries.history(partNumber),
    enabled,
  });
}
