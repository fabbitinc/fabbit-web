import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  attachPartFiles,
  deletePartDrawing,
  detachPartFile,
  exportParts,
  exportPartBomTree,
  fetchAssignableMembers,
  fetchAssignableTeams,
  fetchAvailableProjects,
  fetchPartBom,
  fetchPartBomTree,
  fetchPartDetail,
  fetchPartFiles,
  fetchPartFilterOptions,
  fetchPartOwner,
  fetchPartProjects,
  fetchPartsList,
  fetchPartSuppliers,
  fetchTeamLookup,
  linkPartsToProject,
  registerPartDrawing,
  updatePartOwner,
} from "@/features/parts/api/parts.api";
import type {
  AttachPartFilesRequestDto,
  ExportPartsQueryDto,
  ExportPartBomTreeQueryDto,
  LinkProjectPartsRequestDto,
  ListPartsQueryDto,
  ListProjectsQueryDto,
  PartBomTreeQueryDto,
  RegisterPartDrawingRequestDto,
  UpdatePartOwnerRequestDto,
} from "@/features/parts/api/parts.types";

export const partsKeys = {
  all: ["parts"] as const,
  filterOptions: () => ["parts", "filter-options"] as const,
  lists: () => ["parts", "list"] as const,
  list: (query: ListPartsQueryDto) => ["parts", "list", query] as const,
  detail: (partId: string) => ["parts", partId, "detail"] as const,
  bom: (partId: string) => ["parts", partId, "bom"] as const,
  bomTree: (partId: string, query: PartBomTreeQueryDto) => ["parts", partId, "bom-tree", query] as const,
  files: (partId: string) => ["parts", partId, "files"] as const,
  suppliers: (partId: string) => ["parts", partId, "suppliers"] as const,
  projects: (partId: string) => ["parts", partId, "projects"] as const,
  owner: (partId: string) => ["parts", partId, "owner"] as const,
  availableProjects: (query: ListProjectsQueryDto) => ["parts", "available-projects", query] as const,
  members: () => ["parts", "members"] as const,
  teams: () => ["parts", "teams"] as const,
  teamLookup: () => ["parts", "team-lookup"] as const,
};

export const partsQueries = {
  filterOptions: () =>
    queryOptions({
      queryKey: partsKeys.filterOptions(),
      queryFn: fetchPartFilterOptions,
      staleTime: 60_000,
    }),
  list: (query: ListPartsQueryDto) =>
    queryOptions({
      queryKey: partsKeys.list(query),
      queryFn: () => fetchPartsList(query),
      staleTime: 30_000,
    }),
  detail: (partId: string) =>
    queryOptions({
      queryKey: partsKeys.detail(partId),
      queryFn: () => fetchPartDetail(partId),
      staleTime: 30_000,
    }),
  bom: (partId: string) =>
    queryOptions({
      queryKey: partsKeys.bom(partId),
      queryFn: () => fetchPartBom(partId),
      staleTime: 30_000,
    }),
  bomTree: (partId: string, query: PartBomTreeQueryDto) =>
    queryOptions({
      queryKey: partsKeys.bomTree(partId, query),
      queryFn: () => fetchPartBomTree(partId, query),
      staleTime: 30_000,
    }),
  files: (partId: string) =>
    queryOptions({
      queryKey: partsKeys.files(partId),
      queryFn: () => fetchPartFiles(partId),
      staleTime: 10_000,
    }),
  suppliers: (partId: string) =>
    queryOptions({
      queryKey: partsKeys.suppliers(partId),
      queryFn: () => fetchPartSuppliers(partId),
      staleTime: 60_000,
    }),
  projects: (partId: string) =>
    queryOptions({
      queryKey: partsKeys.projects(partId),
      queryFn: () => fetchPartProjects(partId),
      staleTime: 30_000,
    }),
  owner: (partId: string) =>
    queryOptions({
      queryKey: partsKeys.owner(partId),
      queryFn: () => fetchPartOwner(partId),
      staleTime: 30_000,
    }),
  availableProjects: (query: ListProjectsQueryDto) =>
    queryOptions({
      queryKey: partsKeys.availableProjects(query),
      queryFn: () => fetchAvailableProjects(query),
      staleTime: 30_000,
    }),
  members: () =>
    queryOptions({
      queryKey: partsKeys.members(),
      queryFn: fetchAssignableMembers,
      staleTime: 60_000,
    }),
  teams: () =>
    queryOptions({
      queryKey: partsKeys.teams(),
      queryFn: fetchAssignableTeams,
      staleTime: 60_000,
    }),
  teamLookup: () =>
    queryOptions({
      queryKey: partsKeys.teamLookup(),
      queryFn: fetchTeamLookup,
      staleTime: 60_000,
    }),
};

export const partsMutations = {
  attachFiles: (partId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "attach-files"],
      mutationFn: (request: AttachPartFilesRequestDto) => attachPartFiles(partId, request),
    }),
  detachFile: (partId: string, fileId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "detach-file", fileId],
      mutationFn: () => detachPartFile(partId, fileId),
    }),
  updateOwner: (partId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "update-owner"],
      mutationFn: (request: UpdatePartOwnerRequestDto) => updatePartOwner(partId, request),
    }),
  registerDrawing: (partId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "register-drawing"],
      mutationFn: (request: RegisterPartDrawingRequestDto) => registerPartDrawing(partId, request),
    }),
  deleteDrawing: (partId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "delete-drawing"],
      mutationFn: () => deletePartDrawing(partId),
    }),
  linkToProject: (projectId: string) =>
    mutationOptions({
      mutationKey: ["parts", "link-to-project", projectId],
      mutationFn: (request: LinkProjectPartsRequestDto) => linkPartsToProject(projectId, request),
    }),
  export: () =>
    mutationOptions({
      mutationKey: ["parts", "export"],
      mutationFn: (query: ExportPartsQueryDto) => exportParts(query),
    }),
  exportBomTree: (partId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "export-bom-tree"],
      mutationFn: (query: ExportPartBomTreeQueryDto) => exportPartBomTree(partId, query),
    }),
};
