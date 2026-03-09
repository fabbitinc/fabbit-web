import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartAssignableTeamsQuery(enabled = true) {
  return useQuery({
    ...partsQueries.teams(),
    enabled,
  });
}
