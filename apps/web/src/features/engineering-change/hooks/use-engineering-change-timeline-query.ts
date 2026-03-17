import { useQuery } from "@tanstack/react-query";
import { engineeringChangeQueries } from "@/features/engineering-change/api/engineering-change.queries";

export function useEngineeringChangeTimelineQuery(changeNumber: number, enabled = true) {
  return useQuery({
    ...engineeringChangeQueries.timeline(changeNumber),
    enabled,
  });
}
