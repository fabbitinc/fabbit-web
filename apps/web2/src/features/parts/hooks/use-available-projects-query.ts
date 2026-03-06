import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";
import type { ListProjectsQueryDto } from "@/features/parts/api/parts.types";

export function useAvailableProjectsQuery(query: ListProjectsQueryDto, enabled = true) {
  return useQuery({
    ...partsQueries.availableProjects(query),
    enabled,
  });
}
