import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  addBomItemApi,
  addBomItemsBatchApi,
  deleteBomItemApi,
  updateBomItemApi,
} from "@/features/parts/api/bom.api";
import {
  approvePartDraft,
  attachPartFiles,
  cancelPartDraft,
  changePartLifecycleState,
  clearPartPreview,
  createPart,
  createPartDraftFromRevision,
  deletePartDrawing,
  deletePartPreviewFile,
  detachPartFile,
  exportPartBomTree,
  exportParts,
  fetchAvailableProjects,
  fetchDrawingProcessing,
  fetchPartBom,
  fetchPartBomTree,
  fetchPartDetail,
  fetchPartFiles,
  fetchPartFilterOptions,
  fetchPartHistory,
  fetchPartPreviewSources,
  fetchPartProjects,
  fetchPartRevisionDiff,
  fetchPartRevisionOptions,
  fetchPartsList,
  fetchPartSuppliers,
  fetchTeamLookup,
  linkPartsToProject,
  registerPartDrawing,
  releasePartDraft,
  selectPartPreviewSource,
  updatePartDraft,
  uploadPartPreviewFile,
} from "@/features/parts/api/parts.api";
import type {
  AttachPartFilesRequestDto,
  CreatePartDraftRequestDto,
  CreatePartRequestDto,
  ExportPartBomTreeQueryDto,
  ExportPartsQueryDto,
  LinkProjectPartsRequestDto,
  ListPartsQueryDto,
  ListProjectsQueryDto,
  PartBomTreeQueryDto,
  PartRevisionChangeReasonRequestDto,
  RegisterPartDrawingRequestDto,
  UpdatePartDraftRequestDto,
  UpdatePartPreviewRequestDto,
  UploadPartPreviewFileRequestDto,
} from "@/features/parts/api/parts.types";
import type { AddBomItemRequest } from "@/api/generated/orval/model/addBomItemRequest";
import type { AddBomItemsBatchRequest } from "@/api/generated/orval/model/addBomItemsBatchRequest";
import type { UpdateBomItemRequest } from "@/api/generated/orval/model/updateBomItemRequest";

export const partsKeys = {
  all: ["parts"] as const,
  filterOptions: () => ["parts", "filter-options"] as const,
  lists: () => ["parts", "list"] as const,
  list: (query: ListPartsQueryDto) => ["parts", "list", query] as const,
  detail: (partId: string, revisionId: string) => ["parts", partId, "revisions", revisionId, "detail"] as const,
  drawingProcessing: (partId: string, revisionId: string) =>
    ["parts", partId, "revisions", revisionId, "drawing-processing"] as const,
  bom: (partId: string, revisionId: string) => ["parts", partId, "revisions", revisionId, "bom"] as const,
  bomTree: (partId: string, revisionId: string, query: PartBomTreeQueryDto) =>
    ["parts", partId, "revisions", revisionId, "bom-tree", query] as const,
  files: (partId: string, revisionId: string) => ["parts", partId, "revisions", revisionId, "files"] as const,
  previewSources: (partId: string, revisionId: string) =>
    ["parts", partId, "revisions", revisionId, "preview-sources"] as const,
  suppliers: (partId: string, revisionId: string) =>
    ["parts", partId, "revisions", revisionId, "suppliers"] as const,
  projects: (partId: string, revisionId: string) =>
    ["parts", partId, "revisions", revisionId, "projects"] as const,
  history: (partId: string) => ["parts", partId, "history"] as const,
  revisionOptions: (partId: string) => ["parts", partId, "revision-options"] as const,
  revisionDiff: (partId: string, revisionId: string, baseRevisionId: string) =>
    ["parts", partId, "revisions", revisionId, "diff", baseRevisionId] as const,
  availableProjects: (query: ListProjectsQueryDto) => ["parts", "available-projects", query] as const,
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
      placeholderData: (previousData) => previousData,
      staleTime: 30_000,
    }),
  detail: (partId: string, revisionId: string) =>
    queryOptions({
      queryKey: partsKeys.detail(partId, revisionId),
      queryFn: () => fetchPartDetail(partId, revisionId),
      staleTime: 30_000,
    }),
  drawingProcessing: (partId: string, revisionId: string) =>
    queryOptions({
      queryKey: partsKeys.drawingProcessing(partId, revisionId),
      queryFn: () => fetchDrawingProcessing(partId, revisionId),
      staleTime: 0,
    }),
  bom: (partId: string, revisionId: string) =>
    queryOptions({
      queryKey: partsKeys.bom(partId, revisionId),
      queryFn: () => fetchPartBom(partId, revisionId),
      staleTime: 30_000,
    }),
  bomTree: (partId: string, revisionId: string, query: PartBomTreeQueryDto) =>
    queryOptions({
      queryKey: partsKeys.bomTree(partId, revisionId, query),
      queryFn: () => fetchPartBomTree(partId, revisionId, query),
      staleTime: 30_000,
    }),
  files: (partId: string, revisionId: string) =>
    queryOptions({
      queryKey: partsKeys.files(partId, revisionId),
      queryFn: () => fetchPartFiles(partId, revisionId),
      staleTime: 10_000,
    }),
  previewSources: (partId: string, revisionId: string) =>
    queryOptions({
      queryKey: partsKeys.previewSources(partId, revisionId),
      queryFn: () => fetchPartPreviewSources(partId, revisionId),
      staleTime: 10_000,
    }),
  suppliers: (partId: string, revisionId: string) =>
    queryOptions({
      queryKey: partsKeys.suppliers(partId, revisionId),
      queryFn: () => fetchPartSuppliers(partId, revisionId),
      staleTime: 60_000,
    }),
  projects: (partId: string, revisionId: string) =>
    queryOptions({
      queryKey: partsKeys.projects(partId, revisionId),
      queryFn: () => fetchPartProjects(partId, revisionId),
      staleTime: 30_000,
    }),
  history: (partId: string) =>
    queryOptions({
      queryKey: partsKeys.history(partId),
      queryFn: () => fetchPartHistory(partId),
      staleTime: 30_000,
    }),
  revisionOptions: (partId: string) =>
    queryOptions({
      queryKey: partsKeys.revisionOptions(partId),
      queryFn: () => fetchPartRevisionOptions(partId),
      staleTime: 30_000,
    }),
  revisionDiff: (partId: string, revisionId: string, baseRevisionId: string) =>
    queryOptions({
      queryKey: partsKeys.revisionDiff(partId, revisionId, baseRevisionId),
      queryFn: () => fetchPartRevisionDiff(partId, revisionId, baseRevisionId),
      staleTime: 60_000,
    }),
  availableProjects: (query: ListProjectsQueryDto) =>
    queryOptions({
      queryKey: partsKeys.availableProjects(query),
      queryFn: () => fetchAvailableProjects(query),
      staleTime: 30_000,
    }),
  teamLookup: () =>
    queryOptions({
      queryKey: partsKeys.teamLookup(),
      queryFn: fetchTeamLookup,
      staleTime: 60_000,
    }),
};

export const partsMutations = {
  create: () =>
    mutationOptions({
      mutationKey: ["parts", "create"],
      mutationFn: (request: CreatePartRequestDto) => createPart(request),
    }),
  createDraftFromRevision: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "create-draft"],
      mutationFn: (request: CreatePartDraftRequestDto = {}) =>
        createPartDraftFromRevision(partId, revisionId, request),
    }),
  approveDraft: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "approve"],
      mutationFn: (request: PartRevisionChangeReasonRequestDto) => approvePartDraft(partId, revisionId, request),
    }),
  releaseDraft: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "release"],
      mutationFn: (request: PartRevisionChangeReasonRequestDto) => releasePartDraft(partId, revisionId, request),
    }),
  cancelDraft: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "cancel"],
      mutationFn: (request: PartRevisionChangeReasonRequestDto) => cancelPartDraft(partId, revisionId, request),
    }),
  attachFiles: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "attach-files"],
      mutationFn: (request: AttachPartFilesRequestDto) => attachPartFiles(partId, revisionId, request),
    }),
  detachFile: (partId: string, revisionId: string, fileId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "detach-file", fileId],
      mutationFn: () => detachPartFile(partId, revisionId, fileId),
    }),
  updateDraft: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "update"],
      mutationFn: (request: UpdatePartDraftRequestDto) => updatePartDraft(partId, revisionId, request),
    }),
  registerDrawing: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "register-drawing"],
      mutationFn: (request: RegisterPartDrawingRequestDto) => registerPartDrawing(partId, revisionId, request),
    }),
  selectPreviewSource: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "select-preview-source"],
      mutationFn: (request: UpdatePartPreviewRequestDto) => selectPartPreviewSource(partId, revisionId, request),
    }),
  clearPreview: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "clear-preview"],
      mutationFn: () => clearPartPreview(partId, revisionId),
    }),
  uploadPreviewFile: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "upload-preview-file"],
      mutationFn: (request: UploadPartPreviewFileRequestDto) => uploadPartPreviewFile(partId, revisionId, request),
    }),
  deletePreviewFile: (partId: string, revisionId: string, previewFileId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "delete-preview-file", previewFileId],
      mutationFn: () => deletePartPreviewFile(partId, revisionId, previewFileId),
    }),
  deleteDrawing: (partId: string, revisionId: string, drawingId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "delete-drawing", drawingId],
      mutationFn: () => deletePartDrawing(partId, revisionId, drawingId),
    }),
  exportParts: () =>
    mutationOptions({
      mutationKey: ["parts", "export"],
      mutationFn: (query: ExportPartsQueryDto) => exportParts(query),
    }),
  exportBomTree: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "export-bom-tree"],
      mutationFn: (query: ExportPartBomTreeQueryDto) => exportPartBomTree(partId, revisionId, query),
    }),
  linkPartsToProject: (projectId: string) =>
    mutationOptions({
      mutationKey: ["projects", projectId, "link-parts"],
      mutationFn: (request: LinkProjectPartsRequestDto) => linkPartsToProject(projectId, request),
    }),
  changeLifecycleState: (partId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "change-lifecycle"],
      mutationFn: (targetState: string) => changePartLifecycleState(partId, targetState),
    }),
  addBomItem: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "add-bom-item"],
      mutationFn: (request: AddBomItemRequest) => addBomItemApi(partId, revisionId, request),
    }),
  addBomItemsBatch: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "add-bom-items-batch"],
      mutationFn: (request: AddBomItemsBatchRequest) => addBomItemsBatchApi(partId, revisionId, request),
    }),
  updateBomItem: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "update-bom-item"],
      mutationFn: ({ bomItemId, request }: { bomItemId: string; request: UpdateBomItemRequest }) =>
        updateBomItemApi(partId, revisionId, bomItemId, request),
    }),
  deleteBomItem: (partId: string, revisionId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "revisions", revisionId, "delete-bom-item"],
      mutationFn: (bomItemId: string) => deleteBomItemApi(partId, revisionId, bomItemId),
    }),
};
