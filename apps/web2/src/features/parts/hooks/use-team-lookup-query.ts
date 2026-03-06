import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function useTeamLookupQuery(enabled = true) {
  return useQuery({
    ...partsQueries.teamLookup(),
    enabled,
  });
}
