import { useQuery } from "@tanstack/react-query";
import { changeRequestQueries } from "@/features/change-request/api/change-request.queries";

export function useChangeRequestTimelineQuery(changeNumber: number, enabled = true) {
  return useQuery({
    ...changeRequestQueries.timeline(changeNumber),
    enabled,
  });
}
