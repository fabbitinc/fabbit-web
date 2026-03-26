import {
  attachFiles as attachFilesApiV1PartRevisionFilesPost,
  createDrawing as createDrawingApiV1PartRevisionDrawingsPost,
  deleteDrawing as deleteDrawingApiV1PartRevisionDrawingsDelete,
  deleteFile as deleteFileApiV1PartRevisionFilesDelete,
  getFiles as getFilesApiV1PartRevisionFilesGet,
} from "@/api/generated/orval/part-revision-assets/part-revision-assets";
import {
  cancel as cancelPartRevisionApiV1PartRevisionCancelPost,
  createDraft as createDraftApiV1PartRevisionDraftPost,
  release as releasePartRevisionApiV1PartRevisionReleasePost,
  update1 as updatePartRevisionApiV1PartRevisionPatch,
} from "@/api/generated/orval/part-revision-commands/part-revision-commands";
import {
  createPreviewFile as createPreviewFileApiV1PartRevisionPreviewFilesPost,
  delete1 as clearPartPreviewApiV1PartRevisionPreviewDelete,
  deletePreviewFile as deletePreviewFileApiV1PartRevisionPreviewFilesDelete,
  getProcessing as getPreviewProcessingApiV1PartRevisionPreviewProcessingGet,
  getSources as getPreviewSourcesApiV1PartRevisionPreviewSourcesGet,
  update2 as selectPreviewSourceApiV1PartRevisionPreviewPatch,
} from "@/api/generated/orval/part-revision-previews/part-revision-previews";
import {
  exportBomTree as exportBomTreeApiV1PartRevisionBomTreeExportGet,
  get1 as getPartRevisionApiV1PartRevisionGet,
  getBom as getBomApiV1PartRevisionBomGet,
  getBomTree as getBomTreeApiV1PartRevisionBomTreeGet,
  getDiff as getDiffApiV1PartRevisionDiffGet,
  getHistory as getHistoryApiV1PartHistoryGet,
  getProjects as getProjectsApiV1PartRevisionProjectsGet,
  getSuppliers as getSuppliersApiV1PartRevisionSuppliersGet,
} from "@/api/generated/orval/part-revisions/part-revisions";
import {
  changeLifecycleState as changeLifecycleStateApiV1PartsLifecyclePost,
  createPart as createPartApiV1PartsPost,
  exportParts as exportPartsApiV1PartsExportGet,
  getFilterOptions as getFilterOptionsApiV1PartsFilterOptionsGet,
  listInProgressParts as listInProgressPartsApiV1PartsInProgressGet,
  listParts as listPartsApiV1PartsGet,
} from "@/api/generated/orval/parts/parts";
import { linkParts as linkPartsApiV1ProjectsProjectIdPartsPost } from "@/api/generated/orval/project-parts/project-parts";
import { listProjects as listProjectsApiV1ProjectsGet } from "@/api/generated/orval/projects/projects";
import { listTeams as listTeamsApiV1TeamsGet } from "@/api/generated/orval/teams/teams";
import type {
  AttachPartFilesRequestDto,
  AttachPartFilesResponseDto,
  CreatePartDraftRequestDto,
  CreatePartRequestDto,
  DrawingProcessingResponseDto,
  ExportPartBomTreeQueryDto,
  ExportPartsQueryDto,
  LinkProjectPartsRequestDto,
  LinkProjectPartsResponseDto,
  ListPartsQueryDto,
  ListProjectsQueryDto,
  PartBomResponseDto,
  PartBomTreeQueryDto,
  PartBomTreeResponseDto,
  PartDetailResponseDto,
  PartFilesResponseDto,
  PartFilterOptionsResponseDto,
  PartInProgressListResponseDto,
  PartListResponseDto,
  PartListStatusDto,
  PartPreviewSourcesResponseDto,
  PartProjectsResponseDto,
  PartRevisionChangeReasonRequestDto,
  PartRevisionDiffResponseDto,
  PartRevisionHistoryResponseDto,
  PartSuppliersResponseDto,
  ProjectListResponseDto,
  RegisterPartDrawingRequestDto,
  RegisterPartDrawingResponseDto,
  UpdatePartDraftRequestDto,
  UpdatePartPreviewRequestDto,
  UploadPartPreviewFileRequestDto,
} from "@/features/parts/api/parts.types";
import {
  DEFAULT_PART_DRAWING_FAILURE_MESSAGE,
  getPartDrawingFailureMessage,
  resolvePartDrawingFailureCode,
} from "@/features/parts/lib/part-drawing-failure";
import type {
  PartAttachmentModel,
  PartBomItemModel,
  PartBomModel,
  PartBomTreeModel,
  PartBomTreeNodeModel,
  PartDetailModel,
  PartDrawingModel,
  PartDrawingProcessingModel,
  PartFilterOptionsModel,
  PartListItemModel,
  PartListResultModel,
  PartPreviewSourceModel,
  PartProjectModel,
  PartsAvailableProjectModel,
  PartsAvailableTeamModel,
  PartRevisionDiffModel,
  PartRevisionHistoryDraftModel,
  PartRevisionHistoryItemModel,
  PartSupplierModel,
} from "@/features/parts/types/parts-model";

export async function fetchPartsList(query: ListPartsQueryDto): Promise<PartListResultModel> {
  if (query.source === "workbench") {
    const response = await listInProgressPartsApiV1PartsInProgressGet({
      search: query.search,
      category: query.category,
      lifecycle_state: query.lifecycle_state,
      statuses: query.statuses,
      mine_only: query.mine_only,
      has_drawing: query.has_drawing,
      has_children: query.has_children,
      next_cursor: query.next_cursor,
      prev_cursor: query.prev_cursor,
      limit: query.limit,
    });
    const result = response as PartInProgressListResponseDto;

    return {
      nextCursor: result.next_cursor ?? null,
      prevCursor: result.prev_cursor ?? null,
      limit: query.limit ?? 15,
      items: (result.items ?? []).map(toPartInProgressListItemModel),
    };
  }

  const response = await listPartsApiV1PartsGet({
    search: query.search,
    category: query.category,
    lifecycle_state: query.lifecycle_state,
    has_drawing: query.has_drawing,
    has_children: query.has_children,
    next_cursor: query.next_cursor,
    prev_cursor: query.prev_cursor,
    limit: query.limit,
  });
  const result = response as PartListResponseDto;

  return {
    nextCursor: result.next_cursor ?? null,
    prevCursor: result.prev_cursor ?? null,
    limit: query.limit ?? 15,
    items: (result.items ?? []).map(toPartListItemModel),
  };
}

export async function createPart(request: CreatePartRequestDto): Promise<PartDetailModel> {
  const response = await createPartApiV1PartsPost(request);
  return toPartDetailModel(response as PartDetailResponseDto);
}

export async function createPartDraftFromRevision(
  partId: string,
  revisionId: string,
  request: CreatePartDraftRequestDto = {},
): Promise<PartDetailModel> {
  const response = await createDraftApiV1PartRevisionDraftPost(partId, revisionId, request);
  return toPartDetailModel(response as PartDetailResponseDto);
}

export async function approvePartDraft(
  partId: string,
  revisionId: string,
  request: PartRevisionChangeReasonRequestDto,
): Promise<PartDetailModel> {
  return releasePartDraft(partId, revisionId, request);
}

export async function releasePartDraft(
  partId: string,
  revisionId: string,
  request: PartRevisionChangeReasonRequestDto,
): Promise<PartDetailModel> {
  const response = await releasePartRevisionApiV1PartRevisionReleasePost(partId, revisionId, request);
  return toPartDetailModel(response as PartDetailResponseDto);
}

export async function cancelPartDraft(
  partId: string,
  revisionId: string,
  request: PartRevisionChangeReasonRequestDto,
): Promise<void> {
  await cancelPartRevisionApiV1PartRevisionCancelPost(partId, revisionId, request);
}

export async function changePartLifecycleState(
  partId: string,
  targetState: string,
): Promise<{ partId: string; lifecycleState: string }> {
  const response = await changeLifecycleStateApiV1PartsLifecyclePost(partId, {
    target_state: targetState as "ACTIVE" | "EOL" | "OBSOLETE",
  });
  const result = response as { part_id?: string; lifecycle_state?: string } | undefined;

  return {
    partId: result?.part_id ?? partId,
    lifecycleState: result?.lifecycle_state ?? targetState,
  };
}

export async function fetchPartFilterOptions(): Promise<PartFilterOptionsModel> {
  const response = await getFilterOptionsApiV1PartsFilterOptionsGet();
  const result = response as PartFilterOptionsResponseDto;

  return {
    categories: result.categories,
    lifecycleStates: result.lifecycle_states,
  };
}

export async function fetchPartDetail(partId: string, revisionId: string): Promise<PartDetailModel> {
  const response = await getPartRevisionApiV1PartRevisionGet(partId, revisionId);
  return toPartDetailModel(response as PartDetailResponseDto);
}

export async function fetchPartBom(partId: string, revisionId: string): Promise<PartBomModel> {
  const response = await getBomApiV1PartRevisionBomGet(partId, revisionId);
  const bom = response as PartBomResponseDto;

  return {
    children: (bom.children ?? []).map(toPartBomItemModel),
    parents: (bom.parents ?? []).map(toPartBomItemModel),
  };
}

export async function fetchPartBomTree(
  partId: string,
  revisionId: string,
  query: PartBomTreeQueryDto,
): Promise<PartBomTreeModel> {
  const response = await getBomTreeApiV1PartRevisionBomTreeGet(partId, revisionId, query);
  const tree = response as PartBomTreeResponseDto;

  return {
    root: toPartBomTreeNodeModel(tree.root),
    direction: tree.direction === "REVERSE" ? "reverse" : "forward",
    totalCount: tree.total_count,
  };
}

export async function fetchPartSuppliers(partId: string, revisionId: string): Promise<PartSupplierModel[]> {
  const response = await getSuppliersApiV1PartRevisionSuppliersGet(partId, revisionId);
  const suppliers = response as PartSuppliersResponseDto;

  return (suppliers.items ?? []).map((supplier) => ({
    id: supplier.id,
    companyName: supplier.company_name,
    code: supplier.code ?? null,
    country: supplier.country ?? null,
    unitCost: supplier.unit_cost ?? null,
  }));
}

export async function fetchPartFiles(partId: string, revisionId: string): Promise<PartAttachmentModel[]> {
  const response = await getFilesApiV1PartRevisionFilesGet(partId, revisionId);
  return ((response as PartFilesResponseDto).items ?? []).map(toPartAttachmentModel);
}

export async function fetchPartPreviewSources(partId: string, revisionId: string): Promise<PartPreviewSourceModel[]> {
  const response = await getPreviewSourcesApiV1PartRevisionPreviewSourcesGet(partId, revisionId);
  const result = response as PartPreviewSourcesResponseDto;

  return (result.items ?? [])
    .filter((source) => source.source_type === "DRAWING" || source.source_type === "PREVIEW_FILE")
    .map(toPartPreviewSourceModel);
}

export async function attachPartFiles(
  partId: string,
  revisionId: string,
  request: AttachPartFilesRequestDto,
): Promise<PartAttachmentModel[]> {
  const response = await attachFilesApiV1PartRevisionFilesPost(partId, revisionId, request);
  const result = response as AttachPartFilesResponseDto;

  return result
    .filter((item) => item.attachment_type !== "DRAWING")
    .map(toPartAttachmentModel);
}

export async function detachPartFile(partId: string, revisionId: string, fileId: string) {
  await deleteFileApiV1PartRevisionFilesDelete(partId, revisionId, fileId);
}

export async function fetchPartProjects(partId: string, revisionId: string): Promise<PartProjectModel[]> {
  const response = await getProjectsApiV1PartRevisionProjectsGet(partId, revisionId);
  const projects = response as PartProjectsResponseDto;

  return (projects.items ?? []).map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description ?? null,
  }));
}

export async function updatePartDraft(
  partId: string,
  revisionId: string,
  request: UpdatePartDraftRequestDto,
): Promise<PartDetailModel> {
  const response = await updatePartRevisionApiV1PartRevisionPatch(partId, revisionId, request);
  return toPartDetailModel(response as PartDetailResponseDto);
}

export async function registerPartDrawing(
  partId: string,
  revisionId: string,
  request: RegisterPartDrawingRequestDto,
): Promise<PartDrawingModel> {
  const response = await createDrawingApiV1PartRevisionDrawingsPost(partId, revisionId, request);
  return toRegisteredDrawingModel(response as RegisterPartDrawingResponseDto);
}

export async function selectPartPreviewSource(
  partId: string,
  revisionId: string,
  request: UpdatePartPreviewRequestDto,
): Promise<void> {
  await selectPreviewSourceApiV1PartRevisionPreviewPatch(partId, revisionId, request);
}

export async function clearPartPreview(partId: string, revisionId: string): Promise<void> {
  await clearPartPreviewApiV1PartRevisionPreviewDelete(partId, revisionId);
}

export async function uploadPartPreviewFile(
  partId: string,
  revisionId: string,
  request: UploadPartPreviewFileRequestDto,
): Promise<void> {
  await createPreviewFileApiV1PartRevisionPreviewFilesPost(partId, revisionId, request);
}

export async function deletePartPreviewFile(
  partId: string,
  revisionId: string,
  previewFileId: string,
): Promise<void> {
  await deletePreviewFileApiV1PartRevisionPreviewFilesDelete(partId, revisionId, previewFileId);
}

export async function fetchDrawingProcessing(
  partId: string,
  revisionId: string,
): Promise<PartDrawingProcessingModel> {
  const response = await getPreviewProcessingApiV1PartRevisionPreviewProcessingGet(partId, revisionId);
  const processing = response as DrawingProcessingResponseDto;
  const failureCode = resolvePartDrawingFailureCode({
    failureCode: processing.failure_code ?? null,
    failureReason: processing.failure_message ?? null,
  });
  const failureMessage =
    getPartDrawingFailureMessage(failureCode) ??
    processing.failure_message ??
    (processing.failure_code ? DEFAULT_PART_DRAWING_FAILURE_MESSAGE : null);

  return {
    status: processing.status,
    failureCode,
    failureMessage,
    pdfReady: processing.pdf_ready,
    webpReady: processing.webp_ready,
    glbReady: processing.glb_ready,
    actionRequiredReason: null,
    allowedRenderSourceExtensions: [],
  };
}

export async function deletePartDrawing(partId: string, revisionId: string, drawingId: string) {
  if (drawingId === "__preview__") {
    await clearPartPreview(partId, revisionId);
    return;
  }

  await deleteDrawingApiV1PartRevisionDrawingsDelete(partId, revisionId, drawingId);
}

export async function fetchAvailableProjects(query: ListProjectsQueryDto): Promise<PartsAvailableProjectModel[]> {
  const response = await listProjectsApiV1ProjectsGet(query);
  const projects = response as ProjectListResponseDto;

  return (projects.items ?? []).map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    partCount: project.part_count,
    isArchived: project.is_archived,
  }));
}

export async function linkPartsToProject(
  projectId: string,
  request: LinkProjectPartsRequestDto,
): Promise<LinkProjectPartsResponseDto> {
  return linkPartsApiV1ProjectsProjectIdPartsPost(projectId, request);
}

export async function fetchTeamLookup(): Promise<PartsAvailableTeamModel[]> {
  const response = await listTeamsApiV1TeamsGet();

  return (response.items ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    memberCount: team.member_count,
  }));
}

export async function exportParts(query: ExportPartsQueryDto): Promise<Blob> {
  const response = await exportPartsApiV1PartsExportGet(query, { responseType: "blob" });
  return response as Blob;
}

export async function exportPartBomTree(
  partId: string,
  revisionId: string,
  query: ExportPartBomTreeQueryDto,
): Promise<Blob> {
  const response = await exportBomTreeApiV1PartRevisionBomTreeExportGet(partId, revisionId, query, {
    responseType: "blob",
  });
  return response as Blob;
}

export async function fetchPartHistory(partId: string): Promise<PartRevisionHistoryItemModel[]> {
  const response = await getHistoryApiV1PartHistoryGet(partId);
  const result = response as PartRevisionHistoryResponseDto;
  return (result.items ?? []).map(toPartRevisionHistoryItemModel);
}

export async function fetchPartRevisionDiff(
  partId: string,
  revisionId: string,
  baseRevisionId: string,
): Promise<PartRevisionDiffModel> {
  const response = await getDiffApiV1PartRevisionDiffGet(partId, revisionId, {
    base_revision_id: baseRevisionId,
  });
  return toPartRevisionDiffModel(response as PartRevisionDiffResponseDto);
}

function toPartListItemModel(part: PartListResponseDto["items"][number]): PartListItemModel {
  const partId = part.id ?? "";

  return {
    id: partId,
    partId,
    revisionId: part.revision_id ?? null,
    partNumber: part.part_number ?? "",
    name: part.name ?? null,
    category: part.category ?? null,
    revision: part.revision_code ?? "",
    lifecycleState: part.lifecycle_state ?? null,
    drawingId: part.has_drawing ? (part.revision_id ?? partId) : null,
    childrenCount: part.children_count ?? 0,
    workStatus: part.revision_status ?? null,
  };
}

function toPartInProgressListItemModel(
  part: PartInProgressListResponseDto["items"][number],
): PartListItemModel {
  const partId = part.part_id ?? "";
  const revisionId = part.revision_id ?? null;

  return {
    id: revisionId ?? partId,
    partId,
    revisionId,
    partNumber: part.part_number ?? "",
    name: part.name ?? null,
    category: part.category ?? null,
    revision: part.revision_code ?? part.base_revision_code ?? "",
    lifecycleState: part.lifecycle_state ?? null,
    drawingId: part.has_drawing ? (revisionId ?? partId) : null,
    childrenCount: part.children_count ?? 0,
    workStatus: (part.status as PartListStatusDto | undefined) ?? null,
  };
}

function toPartDetailModel(part: PartDetailResponseDto): PartDetailModel {
  return {
    partId: part.id ?? "",
    revisionId: part.revision_id ?? "",
    revisionStatus: part.revision_status ?? null,
    baseRevisionId: part.base_revision_id ?? null,
    baseRevisionCode: part.base_revision_code ?? null,
    partNumber: part.part_number ?? "",
    name: part.name ?? null,
    revision: part.revision ?? "",
    material: part.material ?? null,
    unit: part.unit ?? null,
    description: part.description ?? null,
    category: part.category ?? null,
    lifecycleState: part.lifecycle_state ?? null,
    isPhantom: part.is_phantom ?? null,
    leadTimeDays: part.lead_time_days ?? null,
    extendedProperties: part.extended_properties ?? {},
    drawing: part.preview ? toPreviewDrawingModel(part.preview) : null,
    draftCount: part.draft_count ?? 0,
    childrenCount: part.children_count ?? 0,
    parentsCount: part.parents_count ?? 0,
    suppliersCount: part.suppliers_count ?? 0,
    filesCount: part.files_count ?? 0,
    projectsCount: part.projects_count ?? 0,
  };
}

function toPreviewDrawingModel(preview: NonNullable<PartDetailResponseDto["preview"]>): PartDrawingModel {
  return {
    id: preview.source_type === "DRAWING" ? (preview.source_id ?? preview.id ?? "") : "__preview__",
    drawingNumber: null,
    name: null,
    version: null,
    status: preview.source_type ?? null,
    conversionStatus: preview.processing_status ?? null,
    viewerType: preview.viewer_type ?? null,
    viewerUrl: preview.viewer_url ?? null,
    previewUrl: preview.preview_url ?? null,
    originalFileUrl: preview.original_file_url ?? null,
    failureCode: null,
    failureMessage: null,
    webViewRequirement: null,
  };
}

function toRegisteredDrawingModel(drawing: RegisterPartDrawingResponseDto): PartDrawingModel {
  return {
    id: drawing.drawing_id ?? "",
    drawingNumber: drawing.drawing_number ?? null,
    name: drawing.name ?? null,
    version: null,
    status: null,
    conversionStatus: "PENDING",
    viewerType: null,
    viewerUrl: null,
    previewUrl: null,
    originalFileUrl: null,
    failureCode: null,
    failureMessage: null,
    webViewRequirement: null,
  };
}

function toPartBomItemModel(
  item: PartBomResponseDto["children"][number] | PartBomResponseDto["parents"][number],
): PartBomItemModel {
  return {
    id: item.revision_id ?? item.part_id ?? "",
    partId: item.part_id ?? null,
    revisionId: item.revision_id ?? null,
    partNumber: item.part_number ?? "",
    name: item.name ?? null,
    quantity: item.quantity ?? 0,
    extendedProperties: item.extended_properties ?? {},
  };
}

function toPartBomTreeNodeModel(node: PartBomTreeResponseDto["root"]): PartBomTreeNodeModel {
  return {
    id: node.revision_id ?? node.part_id ?? "",
    partId: node.part_id ?? null,
    revisionId: node.revision_id ?? null,
    partNumber: node.part_number ?? "",
    name: node.name ?? null,
    revision: node.revision_code ?? "",
    material: node.material ?? null,
    unit: node.unit ?? null,
    category: node.category ?? null,
    lifecycleState: node.lifecycle_state ?? null,
    quantity: node.quantity ?? 0,
    children: (node.children ?? []).map(toPartBomTreeNodeModel),
  };
}

function toPartAttachmentModel(
  file: PartFilesResponseDto["items"][number] | AttachPartFilesResponseDto[number],
): PartAttachmentModel {
  return {
    id: file.attachment_type === "DRAWING" ? file.drawing_id : file.file_id,
    kind: file.attachment_type === "DRAWING" ? "drawing" : "file",
    originalName: file.original_name,
    contentType: file.content_type,
    fileSize: file.file_size,
    fileUrl: file.file_url ?? null,
    createdAt: file.created_at,
  };
}

function toPartPreviewSourceModel(
  source: PartPreviewSourcesResponseDto["items"][number],
): PartPreviewSourceModel {
  return {
    sourceId: source.source_id ?? "",
    sourceType: source.source_type === "PREVIEW_FILE" ? "PREVIEW_FILE" : "DRAWING",
    attachmentType: source.attachment_type === "PREVIEW_FILE" ? "PREVIEW_FILE" : "DRAWING",
    previewFileId: source.source_type === "PREVIEW_FILE" ? (source.source_id ?? null) : null,
    fileId: source.file_id ?? null,
    drawingId: source.drawing_id ?? null,
    originalName: source.original_name ?? "이름 없는 파일",
    contentType: source.content_type ?? null,
    fileSize: source.file_size ?? null,
    fileUrl: source.file_url ?? null,
    selected: source.selected ?? false,
    deletable: source.deletable ?? false,
    createdAt: source.created_at ?? null,
  };
}

function toPartRevisionHistoryItemModel(
  item: NonNullable<PartRevisionHistoryResponseDto["items"]>[number],
): PartRevisionHistoryItemModel {
  return {
    revisionId: item.revision_id ?? "",
    revisionCode: item.revision_code ?? "",
    status: item.status ?? "DRAFT",
    name: item.name ?? null,
    releasedAt: item.released_at ?? null,
    releasedByName: item.released_by?.full_name ?? null,
    summary: item.summary
      ? {
          attributeChanges: item.summary.attribute_changes ?? 0,
          fileChanges: item.summary.file_changes ?? 0,
          bomChanges: item.summary.bom_changes ?? 0,
        }
      : null,
    drafts: (item.drafts ?? []).map(toPartRevisionHistoryDraftModel),
  };
}

function toPartRevisionHistoryDraftModel(
  draft: NonNullable<NonNullable<PartRevisionHistoryResponseDto["items"]>[number]["drafts"]>[number],
): PartRevisionHistoryDraftModel {
  return {
    revisionId: draft.revision_id ?? "",
    name: draft.name ?? null,
    status: draft.status ?? "DRAFT",
    createdAt: draft.created_at ?? null,
    createdByName: draft.created_by?.full_name ?? null,
    completedAt: draft.completed_at ?? null,
    completedByName: draft.completed_by?.full_name ?? null,
    releasedRevisionCode: draft.released_revision_code ?? null,
    reason: draft.reason ?? null,
  };
}

function toPartRevisionDiffModel(dto: PartRevisionDiffResponseDto): PartRevisionDiffModel {
  return {
    baseRevisionId: dto.base_revision?.revision_id ?? null,
    targetRevisionId: dto.target_revision?.revision_id ?? null,
    baseRevisionCode: dto.base_revision?.revision_code ?? null,
    targetRevisionCode: dto.target_revision?.revision_code ?? null,
    summary: dto.summary
      ? {
          attributeChanges: dto.summary.attribute_changes ?? 0,
          fileChanges: dto.summary.file_changes ?? 0,
          bomChanges: dto.summary.bom_changes ?? 0,
        }
      : null,
    attributes: (dto.attributes ?? []).map((attribute) => ({
      fieldKey: attribute.field_key ?? "",
      fieldLabel: attribute.field_label ?? "",
      changeType: attribute.change_type ?? "CHANGED",
      beforeValue: attribute.before_value ?? null,
      afterValue: attribute.after_value ?? null,
    })),
    files: (dto.files ?? []).map((file) => ({
      itemType: file.item_type ?? "",
      displayName: file.display_name ?? "",
      changeType: file.change_type ?? "CHANGED",
    })),
    bom: (dto.bom ?? []).map((bom) => ({
      lineNumber: bom.line_number ?? null,
      beforePartNumber: bom.before_part_number ?? null,
      beforeName: bom.before_name ?? null,
      beforeQuantity: bom.before_quantity ?? null,
      afterPartNumber: bom.after_part_number ?? null,
      afterName: bom.after_name ?? null,
      afterQuantity: bom.after_quantity ?? null,
      changeType: bom.change_type ?? "CHANGED",
    })),
  };
}
