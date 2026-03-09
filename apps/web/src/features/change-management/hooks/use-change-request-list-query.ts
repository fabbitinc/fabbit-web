import { useQuery } from "@tanstack/react-query";
import { changeManagementQueries } from "@/features/change-management/api/change-management.queries";
import type { ChangeRequestListQueryDto } from "@/features/change-management/api/change-management.types";

export function useChangeRequestListQuery(query: ChangeRequestListQueryDto, enabled = true) {
  return useQuery({
    ...changeManagementQueries.requests(query),
    enabled,
  });
}
