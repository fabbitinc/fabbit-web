import { useQuery } from "@tanstack/react-query";
import { changeManagementQueries } from "@/features/change-management/api/change-management.queries";
import type { EngineeringChangeListQueryDto } from "@/features/change-management/api/change-management.types";

export function useEngineeringChangeListQuery(query: EngineeringChangeListQueryDto, enabled = true) {
  return useQuery({
    ...changeManagementQueries.engineeringChanges(query),
    enabled,
  });
}
