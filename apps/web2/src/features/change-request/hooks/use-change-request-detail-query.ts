import { useQuery } from "@tanstack/react-query";
import { changeRequestQueries } from "@/features/change-request/api/change-request.queries";

export function useChangeRequestDetailQuery(changeNumber: number, enabled = true) {
  return useQuery({
    ...changeRequestQueries.detail(changeNumber),
    enabled,
  });
}
