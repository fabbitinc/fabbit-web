import { useQuery } from "@tanstack/react-query";
import { projectsListQueries } from "@/features/projects-list/api/projects-list.queries";
import type { ListProjectsQueryDto } from "@/features/projects-list/api/projects-list.types";

export function useProjectListQuery(query: ListProjectsQueryDto) {
  return useQuery(projectsListQueries.list(query));
}
