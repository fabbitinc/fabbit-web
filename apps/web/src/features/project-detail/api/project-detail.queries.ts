import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  addProjectMembers,
  archiveProject,
  deleteProject,
  fetchProjectChanges,
  fetchProjectActivities,
  fetchProjectDetail,
  fetchProjectIssues,
  fetchProjectMembers,
  fetchProjectParts,
  linkProjectParts,
  lookupProjectMembers,
  lookupProjectParts,
  removeProjectMembers,
  unlinkProjectParts,
  unarchiveProject,
  updateProject,
} from "@/features/project-detail/api/project-detail.api";
import type {
  AddProjectMembersRequestDto,
  LinkProjectPartsRequestDto,
  ProjectActivitiesQueryDto,
  ProjectMemberLookupQueryDto,
  ProjectPartLookupQueryDto,
  ProjectPartsQueryDto,
  RemoveProjectMembersRequestDto,
  UnlinkProjectPartsRequestDto,
  UpdateProjectRequestDto,
} from "@/features/project-detail/api/project-detail.types";

export const projectDetailKeys = {
  all: ["project-detail"] as const,
  detail: (projectId: string) => ["project-detail", projectId] as const,
  activities: (projectId: string, query: ProjectActivitiesQueryDto) =>
    ["project-detail", projectId, "activities", query] as const,
  issues: (projectId: string) => ["project-detail", projectId, "issues"] as const,
  changes: (projectId: string) => ["project-detail", projectId, "changes"] as const,
  members: (projectId: string) => ["project-detail", projectId, "members"] as const,
  memberLookup: (projectId: string, query: ProjectMemberLookupQueryDto) =>
    ["project-detail", projectId, "member-lookup", query] as const,
  parts: (projectId: string, query: ProjectPartsQueryDto) =>
    ["project-detail", projectId, "parts", query] as const,
  partLookup: (projectId: string, query: ProjectPartLookupQueryDto) =>
    ["project-detail", projectId, "part-lookup", query] as const,
};

export const projectDetailQueries = {
  detail: (projectId: string) =>
    queryOptions({
      queryKey: projectDetailKeys.detail(projectId),
      queryFn: () => fetchProjectDetail(projectId),
      staleTime: 30_000,
    }),
  activities: (projectId: string, query: ProjectActivitiesQueryDto) =>
    queryOptions({
      queryKey: projectDetailKeys.activities(projectId, query),
      queryFn: () => fetchProjectActivities(projectId, query),
      staleTime: 10_000,
    }),
  issues: (projectId: string) =>
    queryOptions({
      queryKey: projectDetailKeys.issues(projectId),
      queryFn: () => fetchProjectIssues(projectId),
      staleTime: 10_000,
    }),
  changes: (projectId: string) =>
    queryOptions({
      queryKey: projectDetailKeys.changes(projectId),
      queryFn: () => fetchProjectChanges(projectId),
      staleTime: 10_000,
    }),
  members: (projectId: string) =>
    queryOptions({
      queryKey: projectDetailKeys.members(projectId),
      queryFn: () => fetchProjectMembers(projectId),
      staleTime: 30_000,
    }),
  memberLookup: (projectId: string, query: ProjectMemberLookupQueryDto) =>
    queryOptions({
      queryKey: projectDetailKeys.memberLookup(projectId, query),
      queryFn: () => lookupProjectMembers(projectId, query),
      staleTime: 10_000,
    }),
  parts: (projectId: string, query: ProjectPartsQueryDto) =>
    queryOptions({
      queryKey: projectDetailKeys.parts(projectId, query),
      queryFn: () => fetchProjectParts(projectId, query),
      staleTime: 30_000,
    }),
  partLookup: (projectId: string, query: ProjectPartLookupQueryDto) =>
    queryOptions({
      queryKey: projectDetailKeys.partLookup(projectId, query),
      queryFn: () => lookupProjectParts(projectId, query),
      staleTime: 10_000,
    }),
};

export const projectDetailMutations = {
  update: (projectId: string) =>
    mutationOptions({
      mutationKey: ["project-detail", projectId, "update"],
      mutationFn: (request: UpdateProjectRequestDto) => updateProject(projectId, request),
    }),
  archive: (projectId: string) =>
    mutationOptions({
      mutationKey: ["project-detail", projectId, "archive"],
      mutationFn: () => archiveProject(projectId),
    }),
  unarchive: (projectId: string) =>
    mutationOptions({
      mutationKey: ["project-detail", projectId, "unarchive"],
      mutationFn: () => unarchiveProject(projectId),
    }),
  delete: (projectId: string) =>
    mutationOptions({
      mutationKey: ["project-detail", projectId, "delete"],
      mutationFn: () => deleteProject(projectId),
    }),
  addMembers: (projectId: string) =>
    mutationOptions({
      mutationKey: ["project-detail", projectId, "add-members"],
      mutationFn: (request: AddProjectMembersRequestDto) => addProjectMembers(projectId, request),
    }),
  removeMembers: (projectId: string) =>
    mutationOptions({
      mutationKey: ["project-detail", projectId, "remove-members"],
      mutationFn: (request: RemoveProjectMembersRequestDto) => removeProjectMembers(projectId, request),
    }),
  linkParts: (projectId: string) =>
    mutationOptions({
      mutationKey: ["project-detail", projectId, "link-parts"],
      mutationFn: (request: LinkProjectPartsRequestDto) => linkProjectParts(projectId, request),
    }),
  unlinkParts: (projectId: string) =>
    mutationOptions({
      mutationKey: ["project-detail", projectId, "unlink-parts"],
      mutationFn: (request: UnlinkProjectPartsRequestDto) => unlinkProjectParts(projectId, request),
    }),
};
