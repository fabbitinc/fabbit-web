import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartProjectsQuery(partId: string, enabled = true) {
  return useQuery({
    ...partsQueries.projects(partId),
    enabled,
  });
}
