import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createProject, fetchProjectList } from "@/features/projects-list/api/projects-list.api";
import type {
  CreateProjectRequestDto,
  ListProjectsQueryDto,
} from "@/features/projects-list/api/projects-list.types";

export const projectsListKeys = {
  all: ["projects-list"] as const,
  lists: () => ["projects-list", "list"] as const,
  list: (query: ListProjectsQueryDto) => ["projects-list", "list", query] as const,
};

export const projectsListQueries = {
  list: (query: ListProjectsQueryDto) =>
    queryOptions({
      queryKey: projectsListKeys.list(query),
      queryFn: () => fetchProjectList(query),
      staleTime: 30_000,
    }),
};

export const projectsListMutations = {
  create: () =>
    mutationOptions({
      mutationKey: ["projects-list", "create"],
      mutationFn: (request: CreateProjectRequestDto) => createProject(request),
    }),
};
