import { useQuery } from "@tanstack/react-query";
import { engineeringChangeQueries } from "@/features/engineering-change/api/engineering-change.queries";

export function useEngineeringChangeDetailQuery(engineeringChangeId: string, enabled = true) {
  return useQuery({
    ...engineeringChangeQueries.detail(engineeringChangeId),
    enabled,
  });
}
