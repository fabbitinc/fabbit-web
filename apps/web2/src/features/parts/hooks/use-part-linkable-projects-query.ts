import { useAvailableProjectsQuery } from "@/features/parts/hooks/use-available-projects-query";
import type { ListProjectsQueryDto } from "@/features/parts/api/parts.types";

export function usePartLinkableProjectsQuery(query: ListProjectsQueryDto, enabled = true) {
  return useAvailableProjectsQuery(query, enabled);
}
