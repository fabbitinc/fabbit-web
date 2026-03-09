import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartAssignableMembersQuery(enabled = true) {
  return useQuery({
    ...partsQueries.members(),
    enabled,
  });
}
