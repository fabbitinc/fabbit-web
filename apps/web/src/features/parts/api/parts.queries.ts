import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  approvePartDraft,
  attachPartFiles,
  cancelPartDraft,
  clearPartPreview,
  createPart,
  createPartDraftFromRevision,
  deletePartPreviewFile,
  deletePartDrawing,
  detachPartFile,
  exportParts,
  exportPartBomTree,
  fetchAvailableProjects,
  fetchDrawingProcessing,
  fetchPartBom,
  fetchPartBomTree,
  fetchPartDetail,
  fetchPartFiles,
  fetchPartFilterOptions,
  fetchPartPreviewSources,
  fetchPartProjects,
  fetchPartsList,
  fetchPartSuppliers,
  fetchTeamLookup,
  linkPartsToProject,
  registerPartDrawing,
  releasePartDraft,
  fetchPartHistory,
  fetchPartRevisionDiff,
  selectPartPreviewSource,
  uploadPartPreviewFile,
  updatePartDraft,
} from "@/features/parts/api/parts.api";
import type {
  AttachPartFilesRequestDto,
  CreatePartRequestDto,
  CreatePartDraftRequestDto,
  ExportPartsQueryDto,
  ExportPartBomTreeQueryDto,
  LinkProjectPartsRequestDto,
  ListPartsQueryDto,
  ListProjectsQueryDto,
  PartBomTreeQueryDto,
  PartRevisionChangeReasonRequestDto,
  RegisterPartDrawingRequestDto,
  UpdatePartPreviewRequestDto,
  UploadPartPreviewFileRequestDto,
  UpdatePartDraftRequestDto,
} from "@/features/parts/api/parts.types";

export const partsKeys = {
  all: ["parts"] as const,
  filterOptions: () => ["parts", "filter-options"] as const,
  lists: () => ["parts", "list"] as const,
  list: (query: ListPartsQueryDto) => ["parts", "list", query] as const,
  detail: (partId: string) => ["parts", partId, "detail"] as const,
  drawingProcessing: (partId: string) => ["parts", partId, "drawing-processing"] as const,
  bom: (partId: string) => ["parts", partId, "bom"] as const,
  bomTree: (partId: string, query: PartBomTreeQueryDto) => ["parts", partId, "bom-tree", query] as const,
  files: (partId: string) => ["parts", partId, "files"] as const,
  previewSources: (partId: string) => ["parts", partId, "preview-sources"] as const,
  suppliers: (partId: string) => ["parts", partId, "suppliers"] as const,
  projects: (partId: string) => ["parts", partId, "projects"] as const,
  availableProjects: (query: ListProjectsQueryDto) => ["parts", "available-projects", query] as const,
  teamLookup: () => ["parts", "team-lookup"] as const,
  approveDraft: (partId: string) => ["parts", partId, "approve-draft"] as const,
  createDraftFromRevision: (partId: string) => ["parts", partId, "create-draft-from-revision"] as const,
  releaseDraft: (partId: string) => ["parts", partId, "release-draft"] as const,
  cancelDraft: (partId: string) => ["parts", partId, "cancel-draft"] as const,
  selectPreviewSource: (partId: string) => ["parts", partId, "select-preview-source"] as const,
  clearPreview: (partId: string) => ["parts", partId, "clear-preview"] as const,
  uploadPreviewFile: (partId: string) => ["parts", partId, "upload-preview-file"] as const,
  deletePreviewFile: (partId: string, previewFileId: string) =>
    ["parts", partId, "delete-preview-file", previewFileId] as const,
  history: (partNumber: string) => ["parts", partNumber, "history"] as const,
  revisionDiff: (partNumber: string, revisionCode: string, baseRevisionCode: string) =>
    ["parts", partNumber, "revision-diff", revisionCode, baseRevisionCode] as const,
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
  detail: (partId: string) =>
    queryOptions({
      queryKey: partsKeys.detail(partId),
      queryFn: () => fetchPartDetail(partId),
      staleTime: 30_000,
    }),
  drawingProcessing: (partId: string) =>
    queryOptions({
      queryKey: partsKeys.drawingProcessing(partId),
      queryFn: () => fetchDrawingProcessing(partId),
      staleTime: 0,
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
  previewSources: (partId: string) =>
    queryOptions({
      queryKey: partsKeys.previewSources(partId),
      queryFn: () => fetchPartPreviewSources(partId),
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
  history: (partNumber: string) =>
    queryOptions({
      queryKey: partsKeys.history(partNumber),
      queryFn: () => fetchPartHistory(partNumber),
      staleTime: 30_000,
    }),
  revisionDiff: (partNumber: string, revisionCode: string, baseRevisionCode: string) =>
    queryOptions({
      queryKey: partsKeys.revisionDiff(partNumber, revisionCode, baseRevisionCode),
      queryFn: () => fetchPartRevisionDiff(partNumber, revisionCode, baseRevisionCode),
      staleTime: 60_000,
    }),
};

export const partsMutations = {
  create: () =>
    mutationOptions({
      mutationKey: ["parts", "create"],
      mutationFn: (request: CreatePartRequestDto) => createPart(request),
    }),
  createDraftFromRevision: (partId: string) =>
    mutationOptions({
      mutationKey: partsKeys.createDraftFromRevision(partId),
      mutationFn: (request: CreatePartDraftRequestDto = {}) =>
        createPartDraftFromRevision(partId, request),
    }),
  approveDraft: (partId: string) =>
    mutationOptions({
      mutationKey: partsKeys.approveDraft(partId),
      mutationFn: (request: PartRevisionChangeReasonRequestDto) => approvePartDraft(partId, request),
    }),
  releaseDraft: (partId: string) =>
    mutationOptions({
      mutationKey: partsKeys.releaseDraft(partId),
      mutationFn: (request: PartRevisionChangeReasonRequestDto) => releasePartDraft(partId, request),
    }),
  cancelDraft: (partId: string) =>
    mutationOptions({
      mutationKey: partsKeys.cancelDraft(partId),
      mutationFn: (request: PartRevisionChangeReasonRequestDto) => cancelPartDraft(partId, request),
    }),
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
  updateDraft: (partId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "update-draft"],
      mutationFn: (request: UpdatePartDraftRequestDto) => updatePartDraft(partId, request),
    }),
  registerDrawing: (partId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "register-drawing"],
      mutationFn: (request: RegisterPartDrawingRequestDto) => registerPartDrawing(partId, request),
    }),
  selectPreviewSource: (partId: string) =>
    mutationOptions({
      mutationKey: partsKeys.selectPreviewSource(partId),
      mutationFn: (request: UpdatePartPreviewRequestDto) => selectPartPreviewSource(partId, request),
    }),
  clearPreview: (partId: string) =>
    mutationOptions({
      mutationKey: partsKeys.clearPreview(partId),
      mutationFn: () => clearPartPreview(partId),
    }),
  uploadPreviewFile: (partId: string) =>
    mutationOptions({
      mutationKey: partsKeys.uploadPreviewFile(partId),
      mutationFn: (request: UploadPartPreviewFileRequestDto) => uploadPartPreviewFile(partId, request),
    }),
  deletePreviewFile: (partId: string, previewFileId: string) =>
    mutationOptions({
      mutationKey: partsKeys.deletePreviewFile(partId, previewFileId),
      mutationFn: () => deletePartPreviewFile(partId, previewFileId),
    }),
  deleteDrawing: (partId: string, drawingId: string) =>
    mutationOptions({
      mutationKey: ["parts", partId, "delete-drawing", drawingId],
      mutationFn: () => deletePartDrawing(partId, drawingId),
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
