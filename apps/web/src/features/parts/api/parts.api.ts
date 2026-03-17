import {
  approve as approveDraftApiV1PartDraftApprovePost,
  approveFromRevision as approveRevisionDraftApiV1PartRevisionDraftApprovePost,
  attachFiles1 as attachDraftFilesApiV1PartDraftFilesPost,
  attachFilesFromRevision as attachRevisionDraftFilesApiV1PartRevisionDraftFilesPost,
  cancel as cancelDraftApiV1PartDraftCancelPost,
  cancelFromRevision as cancelRevisionDraftApiV1PartRevisionDraftCancelPost,
  create as createRevisionDraftApiV1PartRevisionDraftPost,
  createDrawing1 as createDraftDrawingApiV1PartDraftDrawingsPost,
  createDrawingFromRevision as createRevisionDraftDrawingApiV1PartRevisionDraftDrawingsPost,
  deleteDrawing1 as deleteDraftDrawingApiV1PartDraftDrawingsDelete,
  deleteDrawingFromRevision as deleteRevisionDraftDrawingApiV1PartRevisionDraftDrawingsDelete,
  deleteFile1 as deleteDraftFileApiV1PartDraftFilesDelete,
  deleteFileFromRevision as deleteRevisionDraftFileApiV1PartRevisionDraftFilesDelete,
  deletePreview as deleteDraftPreviewApiV1PartDraftPreviewDelete,
  deletePreviewFile1 as deleteDraftPreviewFileApiV1PartDraftPreviewFilesFileIdDelete,
  deletePreviewFileFromRevision as deleteRevisionDraftPreviewFileApiV1PartRevisionDraftPreviewFilesFileIdDelete,
  deletePreviewFromRevision as deleteRevisionDraftPreviewApiV1PartRevisionDraftPreviewDelete,
  get2 as getDraftApiV1PartDraftGet,
  getFiles1 as getDraftFilesApiV1PartDraftFilesGet,
  getFilesFromRevision as getRevisionDraftFilesApiV1PartRevisionDraftFilesGet,
  getFromRevision as getRevisionDraftApiV1PartRevisionDraftGet,
  getPreviewProcessing as getDraftPreviewProcessingApiV1PartDraftPreviewProcessingGet,
  getPreviewProcessingFromRevision as getRevisionDraftPreviewProcessingApiV1PartRevisionDraftPreviewProcessingGet,
  getPreviewSources as getDraftPreviewSourcesApiV1PartDraftPreviewSourcesGet,
  getPreviewSourcesFromRevision as getRevisionDraftPreviewSourcesApiV1PartRevisionDraftPreviewSourcesGet,
  release1 as releaseDraftApiV1PartDraftReleasePost,
  releaseFromRevision as releaseRevisionDraftApiV1PartRevisionDraftReleasePost,
  update3 as updateDraftApiV1PartDraftPatch,
  updateFromRevision as updateRevisionDraftApiV1PartRevisionDraftPatch,
  updatePreview as updateDraftPreviewApiV1PartDraftPreviewPatch,
  updatePreviewFromRevision as updateRevisionDraftPreviewApiV1PartRevisionDraftPreviewPatch,
  uploadPreviewFile as uploadDraftPreviewFileApiV1PartDraftPreviewFilesPost,
  uploadPreviewFileFromRevision as uploadRevisionDraftPreviewFileApiV1PartRevisionDraftPreviewFilesPost,
} from "@/api/generated/orval/part-drafts/part-drafts";
import {
  attachFiles as attachFilesApiV1PartRevisionsFilesPost,
  createDrawing as registerDrawingForPartApiV1PartRevisionsDrawingsPost,
  deleteDrawing as deleteDrawingFromPartApiV1PartRevisionsDrawingsDelete,
  deleteFile as detachFileApiV1PartRevisionsFilesDelete,
  getFiles as getPartFilesApiV1PartRevisionsFilesGet,
} from "@/api/generated/orval/part-revision-assets/part-revision-assets";
import {
  createPreviewFile as uploadPreviewFileApiV1PartRevisionsPreviewFilesPost,
  delete2 as deletePartPreviewApiV1PartRevisionsPreviewDelete,
  deletePreviewFile as deletePreviewFileApiV1PartRevisionsPreviewFilesFileIdDelete,
  getProcessing as getPreviewProcessingApiV1PartRevisionsPreviewProcessingGet,
  getSources as getPreviewSourcesApiV1PartRevisionsPreviewSourcesGet,
  update2 as updatePartPreviewApiV1PartRevisionsPreviewPatch,
} from "@/api/generated/orval/part-revision-previews/part-revision-previews";
import {
  exportBomTree as exportBomApiV1PartRevisionsBomTreeExportGet,
  get3 as getPartApiV1PartRevisionsGet,
  getBom as getPartBomApiV1PartRevisionsBomGet,
  getBomTree as getBomTreeApiV1PartRevisionsBomTreeGet,
  getDiff as getDiffApiV1PartRevisionsDiffGet,
  getHistory as getHistoryApiV1PartsHistoryGet,
  getProjects as getPartProjectsApiV1PartRevisionsProjectsGet,
  getSuppliers as getPartSuppliersApiV1PartRevisionsSuppliersGet,
} from "@/api/generated/orval/part-revisions/part-revisions";
import {
  createPart as createPartApiV1PartsPost,
  exportParts as exportPartsApiV1PartsExportGet,
  getFilterOptions as getFilterOptionsApiV1PartsFilterOptionsGet,
  listInProgressParts as listInProgressPartsApiV1PartsInProgressGet,
  listParts as listPartsApiV1PartsGet,
} from "@/api/generated/orval/parts/parts";
import {
  linkParts as linkPartsToProjectApiV1ProjectsProjectIdPartsPost,
} from "@/api/generated/orval/project-parts/project-parts";
import { listProjects as listProjectsApiV1ProjectsGet } from "@/api/generated/orval/projects/projects";
import { listTeams as listTeamsApiV1TeamsGet } from "@/api/generated/orval/teams/teams";
import type {
  AttachPartFilesRequestDto,
  AttachPartFilesResponseDto,
  CreatePartRequestDto,
  CreatePartDraftRequestDto,
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
  UploadPartPreviewFileRequestDto,
  UpdatePartDraftRequestDto,
  UpdatePartPreviewRequestDto,
} from "@/features/parts/api/parts.types";
import {
  parsePartRouteId,
  toPartDraftRouteId,
  toPartRevisionDraftRouteId,
  toPartRouteId,
} from "@/features/parts/lib/part-route";
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
  PartRevisionHistoryDraftModel,
  PartRevisionDiffModel,
  PartRevisionHistoryItemModel,
  PartSupplierModel,
} from "@/features/parts/types/parts-model";

function resolvePartRef(partId: string) {
  return parsePartRouteId(partId);
}

function resolveRevisionRef(partId: string) {
  const route = resolvePartRef(partId);

  if (route.kind !== "revision") {
    throw new Error("공식 리비전 경로가 필요한 작업입니다.");
  }

  return route;
}

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

  return toPartDetailModel(response as PartDetailResponseDto, {
    kind: "draft",
    partNumber: response.part_number ?? request.part_number,
    draftKey: response.draft_key ?? "",
  });
}

export async function createPartDraftFromRevision(
  partId: string,
  request: CreatePartDraftRequestDto = {},
): Promise<PartDetailModel> {
  const route = resolvePartRef(partId);

  if (route.kind !== "revision") {
    throw new Error("공식 리비전에서만 개정을 시작할 수 있습니다.");
  }

  const response = await createRevisionDraftApiV1PartRevisionDraftPost(
    route.partNumber,
    route.revisionCode,
    request,
  );

  return toPartDetailModel(response as PartDetailResponseDto, {
    kind: "revision-draft",
    partNumber: route.partNumber,
    revisionCode: route.revisionCode,
    draftKey: response.draft_key ?? "",
  });
}

export async function approvePartDraft(
  partId: string,
  request: PartRevisionChangeReasonRequestDto,
): Promise<PartDetailModel> {
  const route = resolvePartRef(partId);

  if (route.kind === "draft") {
    const response = await approveDraftApiV1PartDraftApprovePost(
      route.partNumber,
      route.draftKey,
      request,
    );
    return toPartDetailModel(response as PartDetailResponseDto);
  }

  if (route.kind === "revision-draft") {
    const response = await approveRevisionDraftApiV1PartRevisionDraftApprovePost(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
      request,
    );
    return toPartDetailModel(response as PartDetailResponseDto);
  }

  throw new Error("초안에서만 승인할 수 있습니다.");
}

export async function releasePartDraft(
  partId: string,
  request: PartRevisionChangeReasonRequestDto,
): Promise<PartDetailModel> {
  const route = resolvePartRef(partId);

  if (route.kind === "draft") {
    const response = await releaseDraftApiV1PartDraftReleasePost(
      route.partNumber,
      route.draftKey,
      request,
    );
    return toPartDetailModel(response as PartDetailResponseDto);
  }

  if (route.kind === "revision-draft") {
    const response = await releaseRevisionDraftApiV1PartRevisionDraftReleasePost(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
      request,
    );
    return toPartDetailModel(response as PartDetailResponseDto);
  }

  throw new Error("초안에서만 배포할 수 있습니다.");
}

export async function cancelPartDraft(
  partId: string,
  request: PartRevisionChangeReasonRequestDto,
): Promise<void> {
  const route = resolvePartRef(partId);

  if (route.kind === "draft") {
    await cancelDraftApiV1PartDraftCancelPost(
      route.partNumber,
      route.draftKey,
      request,
    );
    return;
  }

  if (route.kind === "revision-draft") {
    await cancelRevisionDraftApiV1PartRevisionDraftCancelPost(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
      request,
    );
    return;
  }

  throw new Error("초안에서만 폐기할 수 있습니다.");
}

export async function fetchPartFilterOptions(): Promise<PartFilterOptionsModel> {
  const response = await getFilterOptionsApiV1PartsFilterOptionsGet();
  const result = response as PartFilterOptionsResponseDto;

  return {
    categories: result.categories,
    lifecycleStates: result.lifecycle_states,
  };
}

export async function fetchPartDetail(partId: string): Promise<PartDetailModel> {
  const route = resolvePartRef(partId);

  if (route.kind === "draft") {
    const response = await getDraftApiV1PartDraftGet(route.partNumber, route.draftKey);
    return toPartDetailModel(response as PartDetailResponseDto, route);
  }

  if (route.kind === "revision-draft") {
    const response = await getRevisionDraftApiV1PartRevisionDraftGet(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
    );
    return toPartDetailModel(response as PartDetailResponseDto, route);
  }

  const response = await getPartApiV1PartRevisionsGet(route.partNumber, route.revisionCode);

  return toPartDetailModel(response as PartDetailResponseDto, route);
}

export async function fetchPartBom(partId: string): Promise<PartBomModel> {
  const { partNumber, revisionCode } = resolveRevisionRef(partId);
  const response = await getPartBomApiV1PartRevisionsBomGet(partNumber, revisionCode);
  const bom = response as PartBomResponseDto;

  return {
    children: bom.children.map(toPartBomItemModel),
    parents: bom.parents.map(toPartBomItemModel),
  };
}

export async function fetchPartBomTree(
  partId: string,
  query: PartBomTreeQueryDto,
): Promise<PartBomTreeModel> {
  const { partNumber, revisionCode } = resolveRevisionRef(partId);
  const response = await getBomTreeApiV1PartRevisionsBomTreeGet(partNumber, revisionCode, query);
  const tree = response as PartBomTreeResponseDto;

  return {
    root: toPartBomTreeNodeModel(tree.root),
    direction: tree.direction === "REVERSE" ? "reverse" : "forward",
    totalCount: tree.total_count,
  };
}

export async function fetchPartSuppliers(partId: string): Promise<PartSupplierModel[]> {
  const { partNumber, revisionCode } = resolveRevisionRef(partId);
  const response = await getPartSuppliersApiV1PartRevisionsSuppliersGet(partNumber, revisionCode);
  const suppliers = response as PartSuppliersResponseDto;

  return suppliers.items.map((supplier) => ({
    id: supplier.id,
    companyName: supplier.company_name,
    code: supplier.code ?? null,
    country: supplier.country ?? null,
    unitCost: supplier.unit_cost ?? null,
  }));
}

export async function fetchPartFiles(partId: string): Promise<PartAttachmentModel[]> {
  const route = resolvePartRef(partId);
  let response: PartFilesResponseDto;

  if (route.kind === "draft") {
    response = await getDraftFilesApiV1PartDraftFilesGet(
      route.partNumber,
      route.draftKey,
    ) as PartFilesResponseDto;
  } else if (route.kind === "revision-draft") {
    response = await getRevisionDraftFilesApiV1PartRevisionDraftFilesGet(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
    ) as PartFilesResponseDto;
  } else {
    response = await getPartFilesApiV1PartRevisionsFilesGet(
      route.partNumber,
      route.revisionCode,
    ) as PartFilesResponseDto;
  }

  return response.items.map(toPartAttachmentModel);
}

export async function fetchPartPreviewSources(partId: string): Promise<PartPreviewSourceModel[]> {
  const route = resolvePartRef(partId);
  let response: PartPreviewSourcesResponseDto;

  if (route.kind === "draft") {
    response = await getDraftPreviewSourcesApiV1PartDraftPreviewSourcesGet(
      route.partNumber,
      route.draftKey,
    ) as PartPreviewSourcesResponseDto;
  } else if (route.kind === "revision-draft") {
    response = await getRevisionDraftPreviewSourcesApiV1PartRevisionDraftPreviewSourcesGet(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
    ) as PartPreviewSourcesResponseDto;
  } else {
    response = await getPreviewSourcesApiV1PartRevisionsPreviewSourcesGet(
      route.partNumber,
      route.revisionCode,
    ) as PartPreviewSourcesResponseDto;
  }

  return (response.items ?? [])
    .filter(
      (source) =>
        source.source_type === "DRAWING" || source.source_type === "PREVIEW_FILE",
    )
    .map(toPartPreviewSourceModel);
}

export async function attachPartFiles(partId: string, request: AttachPartFilesRequestDto): Promise<PartAttachmentModel[]> {
  const route = resolvePartRef(partId);
  let response: AttachPartFilesResponseDto;

  if (route.kind === "draft") {
    response = await attachDraftFilesApiV1PartDraftFilesPost(
      route.partNumber,
      route.draftKey,
      request,
    ) as AttachPartFilesResponseDto;
  } else if (route.kind === "revision-draft") {
    response = await attachRevisionDraftFilesApiV1PartRevisionDraftFilesPost(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
      request,
    ) as AttachPartFilesResponseDto;
  } else {
    response = await attachFilesApiV1PartRevisionsFilesPost(
      route.partNumber,
      route.revisionCode,
      request,
    ) as AttachPartFilesResponseDto;
  }

  return response
    .filter((item) => item.attachment_type !== "DRAWING")
    .map(toPartAttachmentModel);
}

export async function detachPartFile(partId: string, fileId: string) {
  const route = resolvePartRef(partId);

  if (route.kind === "draft") {
    await deleteDraftFileApiV1PartDraftFilesDelete(
      route.partNumber,
      route.draftKey,
      fileId,
    );
    return;
  }

  if (route.kind === "revision-draft") {
    await deleteRevisionDraftFileApiV1PartRevisionDraftFilesDelete(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
      fileId,
    );
    return;
  }

  await detachFileApiV1PartRevisionsFilesDelete(
    route.partNumber,
    route.revisionCode,
    fileId,
  );
}

export async function fetchPartProjects(partId: string): Promise<PartProjectModel[]> {
  const { partNumber, revisionCode } = resolveRevisionRef(partId);
  const response = await getPartProjectsApiV1PartRevisionsProjectsGet(partNumber, revisionCode);
  const projects = response as PartProjectsResponseDto;

  return projects.items.map((project) => ({
    id: project.id,
    name: project.name,
      description: project.description ?? null,
  }));
}

export async function updatePartDraft(
  partId: string,
  request: UpdatePartDraftRequestDto,
): Promise<PartDetailModel> {
  const route = resolvePartRef(partId);

  if (route.kind === "draft") {
    const response = await updateDraftApiV1PartDraftPatch(
      route.partNumber,
      route.draftKey,
      request,
    );

    return toPartDetailModel(response as PartDetailResponseDto, route);
  }

  if (route.kind === "revision-draft") {
    const response = await updateRevisionDraftApiV1PartRevisionDraftPatch(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
      request,
    );

    return toPartDetailModel(response as PartDetailResponseDto, route);
  }

  throw new Error("초안에서만 편집할 수 있습니다.");
}

export async function registerPartDrawing(partId: string, request: RegisterPartDrawingRequestDto): Promise<PartDrawingModel> {
  const route = resolvePartRef(partId);
  let response: RegisterPartDrawingResponseDto;

  if (route.kind === "draft") {
    response = await createDraftDrawingApiV1PartDraftDrawingsPost(
      route.partNumber,
      route.draftKey,
      request,
    ) as RegisterPartDrawingResponseDto;
  } else if (route.kind === "revision-draft") {
    response = await createRevisionDraftDrawingApiV1PartRevisionDraftDrawingsPost(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
      request,
    ) as RegisterPartDrawingResponseDto;
  } else {
    response = await registerDrawingForPartApiV1PartRevisionsDrawingsPost(
      route.partNumber,
      route.revisionCode,
      request,
    ) as RegisterPartDrawingResponseDto;
  }

  return toRegisteredDrawingModel(response);
}

export async function selectPartPreviewSource(
  partId: string,
  request: UpdatePartPreviewRequestDto,
): Promise<void> {
  const route = resolvePartRef(partId);

  if (route.kind === "draft") {
    await updateDraftPreviewApiV1PartDraftPreviewPatch(
      route.partNumber,
      route.draftKey,
      request,
    );
    return;
  }

  if (route.kind === "revision-draft") {
    await updateRevisionDraftPreviewApiV1PartRevisionDraftPreviewPatch(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
      request,
    );
    return;
  }

  await updatePartPreviewApiV1PartRevisionsPreviewPatch(
    route.partNumber,
    route.revisionCode,
    request,
  );
}

export async function clearPartPreview(partId: string): Promise<void> {
  const route = resolvePartRef(partId);

  if (route.kind === "draft") {
    await deleteDraftPreviewApiV1PartDraftPreviewDelete(
      route.partNumber,
      route.draftKey,
    );
    return;
  }

  if (route.kind === "revision-draft") {
    await deleteRevisionDraftPreviewApiV1PartRevisionDraftPreviewDelete(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
    );
    return;
  }

  await deletePartPreviewApiV1PartRevisionsPreviewDelete(
    route.partNumber,
    route.revisionCode,
  );
}

export async function uploadPartPreviewFile(
  partId: string,
  request: UploadPartPreviewFileRequestDto,
): Promise<void> {
  const route = resolvePartRef(partId);

  if (route.kind === "draft") {
    await uploadDraftPreviewFileApiV1PartDraftPreviewFilesPost(
      route.partNumber,
      route.draftKey,
      request,
    );
    return;
  }

  if (route.kind === "revision-draft") {
    await uploadRevisionDraftPreviewFileApiV1PartRevisionDraftPreviewFilesPost(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
      request,
    );
    return;
  }

  await uploadPreviewFileApiV1PartRevisionsPreviewFilesPost(
    route.partNumber,
    route.revisionCode,
    request,
  );
}

export async function deletePartPreviewFile(
  partId: string,
  previewFileId: string,
): Promise<void> {
  const route = resolvePartRef(partId);

  if (route.kind === "draft") {
    await deleteDraftPreviewFileApiV1PartDraftPreviewFilesFileIdDelete(
      route.partNumber,
      route.draftKey,
      previewFileId,
    );
    return;
  }

  if (route.kind === "revision-draft") {
    await deleteRevisionDraftPreviewFileApiV1PartRevisionDraftPreviewFilesFileIdDelete(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
      previewFileId,
    );
    return;
  }

  await deletePreviewFileApiV1PartRevisionsPreviewFilesFileIdDelete(
    route.partNumber,
    route.revisionCode,
    previewFileId,
  );
}

export async function fetchDrawingProcessing(partId: string): Promise<PartDrawingProcessingModel> {
  const route = resolvePartRef(partId);
  let response: DrawingProcessingResponseDto;

  if (route.kind === "draft") {
    response = await getDraftPreviewProcessingApiV1PartDraftPreviewProcessingGet(
      route.partNumber,
      route.draftKey,
    ) as DrawingProcessingResponseDto;
  } else if (route.kind === "revision-draft") {
    response = await getRevisionDraftPreviewProcessingApiV1PartRevisionDraftPreviewProcessingGet(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
    ) as DrawingProcessingResponseDto;
  } else {
    response = await getPreviewProcessingApiV1PartRevisionsPreviewProcessingGet(
      route.partNumber,
      route.revisionCode,
    ) as DrawingProcessingResponseDto;
  }
  const processing = response;
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

export async function deletePartDrawing(partId: string, drawingId: string) {
  const route = resolvePartRef(partId);

  if (drawingId === "__preview__") {
    await clearPartPreview(partId);
    return;
  }

  if (route.kind === "draft") {
    await deleteDraftDrawingApiV1PartDraftDrawingsDelete(
      route.partNumber,
      route.draftKey,
      drawingId,
    );
    return;
  }

  if (route.kind === "revision-draft") {
    await deleteRevisionDraftDrawingApiV1PartRevisionDraftDrawingsDelete(
      route.partNumber,
      route.revisionCode,
      route.draftKey,
      drawingId,
    );
    return;
  }

  await deleteDrawingFromPartApiV1PartRevisionsDrawingsDelete(
    route.partNumber,
    route.revisionCode,
    drawingId,
  );
}

export async function fetchAvailableProjects(query: ListProjectsQueryDto): Promise<PartsAvailableProjectModel[]> {
  const response = await listProjectsApiV1ProjectsGet(query);
  const projects = response as ProjectListResponseDto;

  return projects.items.map((project) => ({
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
  return linkPartsToProjectApiV1ProjectsProjectIdPartsPost(projectId, request);
}

export async function fetchTeamLookup(): Promise<PartsAvailableTeamModel[]> {
  const response = await listTeamsApiV1TeamsGet();

  return response.items.map((team) => ({
    id: team.id,
    name: team.name,
    memberCount: team.member_count,
  }));
}

export async function exportParts(query: ExportPartsQueryDto): Promise<Blob> {
  const response = await exportPartsApiV1PartsExportGet(query, {
    responseType: "blob",
  });

  return response as Blob;
}

export async function exportPartBomTree(partId: string, query: ExportPartBomTreeQueryDto): Promise<Blob> {
  const { partNumber, revisionCode } = resolveRevisionRef(partId);
  const response = await exportBomApiV1PartRevisionsBomTreeExportGet(partNumber, revisionCode, query, {
    responseType: "blob",
  });

  return response as Blob;
}

function toPartListItemModel(part: PartListResponseDto["items"][number]): PartListItemModel {
  const routeId = toPartRouteId({
    partNumber: part.part_number ?? "",
    revisionCode: part.revision_code ?? "",
  });

  return {
    id: part.id ?? routeId,
    routeId,
    partNumber: part.part_number ?? "",
    name: part.name ?? null,
    category: part.category ?? null,
    revision: part.revision_code ?? "",
    lifecycleState: part.lifecycle_state ?? null,
    drawingId: part.has_drawing ? routeId : null,
    childrenCount: part.children_count ?? 0,
    workStatus: null,
  };
}

function toPartInProgressListItemModel(
  part: PartInProgressListResponseDto["items"][number],
): PartListItemModel {
  const routeId = part.draft_key
    ? part.base_revision_code
      ? toPartRevisionDraftRouteId({
          partNumber: part.part_number ?? "",
          revisionCode: part.base_revision_code,
          draftKey: part.draft_key,
        })
      : toPartDraftRouteId({
          partNumber: part.part_number ?? "",
          draftKey: part.draft_key,
        })
    : toPartRouteId({
        partNumber: part.part_number ?? "",
        revisionCode: part.revision_code ?? "",
      });

  return {
    id: part.revision_id ?? part.part_id ?? routeId,
    routeId,
    partNumber: part.part_number ?? "",
    name: part.name ?? null,
    category: part.category ?? null,
    revision: part.revision_code ?? part.base_revision_code ?? "",
    lifecycleState: part.lifecycle_state ?? null,
    drawingId: part.has_drawing ? routeId : null,
    childrenCount: part.children_count ?? 0,
    workStatus: (part.status as PartListStatusDto | undefined) ?? null,
  };
}

function toPartDetailModel(part: PartDetailResponseDto, route?: ReturnType<typeof resolvePartRef>): PartDetailModel {
  const routeId = route
    ? route.kind === "draft"
      ? toPartDraftRouteId({
          partNumber: route.partNumber,
          draftKey: route.draftKey,
        })
      : route.kind === "revision-draft"
        ? toPartRevisionDraftRouteId({
            partNumber: route.partNumber,
            revisionCode: route.revisionCode,
            draftKey: route.draftKey,
          })
        : toPartRouteId({
            partNumber: route.partNumber,
            revisionCode: route.revisionCode,
          })
    : part.draft_key
      ? toPartDraftRouteId({
          partNumber: part.part_number ?? "",
          draftKey: part.draft_key,
        })
      : toPartRouteId({
          partNumber: part.part_number ?? "",
          revisionCode: part.revision ?? "",
        });

  return {
    id: part.id,
    routeId,
    partNumber: part.part_number,
    name: part.name ?? null,
    revision: part.revision ?? "",
    draftKey: part.draft_key ?? null,
    material: part.material ?? null,
    unit: part.unit ?? null,
    description: part.description ?? null,
    category: part.category ?? null,
    lifecycleState: part.lifecycle_state ?? null,
    isPhantom: part.is_phantom ?? null,
    leadTimeDays: part.lead_time_days ?? null,
    extendedProperties: part.extended_properties,
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
    id: preview.source_type === "DRAWING"
      ? (preview.source_id ?? preview.id ?? "")
      : "__preview__",
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

function toPartBomItemModel(item: PartBomResponseDto["children"][number] | PartBomResponseDto["parents"][number]): PartBomItemModel {
  return {
    id: toPartRouteId({
      partNumber: item.part_number,
      revisionCode: item.revision_code,
    }),
    partNumber: item.part_number,
    name: item.name ?? null,
    quantity: item.quantity,
    extendedProperties: item.extended_properties,
  };
}

function toPartBomTreeNodeModel(node: PartBomTreeResponseDto["root"]): PartBomTreeNodeModel {
  return {
    id: toPartRouteId({
      partNumber: node.part_number,
      revisionCode: node.revision,
    }),
    partNumber: node.part_number,
    name: node.name ?? null,
    revision: node.revision,
    material: node.material ?? null,
    unit: node.unit ?? null,
    category: node.category ?? null,
    lifecycleState: node.lifecycle_state ?? null,
    quantity: node.quantity,
    children: node.children.map(toPartBomTreeNodeModel),
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
    attachmentType:
      source.attachment_type === "PREVIEW_FILE" ? "PREVIEW_FILE" : "DRAWING",
    previewFileId:
      source.source_type === "PREVIEW_FILE" ? (source.source_id ?? null) : null,
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

// ── 이력 / Diff ──────────────────────────────────────────

export async function fetchPartHistory(partNumber: string): Promise<PartRevisionHistoryItemModel[]> {
  const response = await getHistoryApiV1PartsHistoryGet(partNumber);
  const result = response as PartRevisionHistoryResponseDto;
  return (result.items ?? []).map(toPartRevisionHistoryItemModel);
}

export async function fetchPartRevisionDiff(
  partNumber: string,
  revisionCode: string,
  baseRevisionCode: string,
): Promise<PartRevisionDiffModel> {
  const response = await getDiffApiV1PartRevisionsDiffGet(partNumber, revisionCode, {
    base_revision_code: baseRevisionCode,
  });
  const result = response as PartRevisionDiffResponseDto;
  return toPartRevisionDiffModel(result);
}

function toPartRevisionHistoryItemModel(
  item: NonNullable<PartRevisionHistoryResponseDto["items"]>[number],
): PartRevisionHistoryItemModel {
  return {
    revisionId: item.revision_id ?? "",
    revisionCode: item.revision_code ?? "",
    status: (item.status as PartRevisionHistoryItemModel["status"]) ?? "DRAFT",
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
    status: (draft.status as PartRevisionHistoryDraftModel["status"]) ?? "DRAFT",
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
    baseRevisionCode: dto.base_revision?.revision_code ?? null,
    targetRevisionCode: dto.target_revision?.revision_code ?? null,
    summary: dto.summary
      ? {
          attributeChanges: dto.summary.attribute_changes ?? 0,
          fileChanges: dto.summary.file_changes ?? 0,
          bomChanges: dto.summary.bom_changes ?? 0,
        }
      : null,
    attributes: (dto.attributes ?? []).map((attr) => ({
      fieldKey: attr.field_key ?? "",
      fieldLabel: attr.field_label ?? "",
      changeType: (attr.change_type as PartRevisionDiffModel["attributes"][number]["changeType"]) ?? "CHANGED",
      beforeValue: attr.before_value ?? null,
      afterValue: attr.after_value ?? null,
    })),
    files: (dto.files ?? []).map((file) => ({
      itemType: file.item_type ?? "",
      displayName: file.display_name ?? "",
      changeType: (file.change_type as PartRevisionDiffModel["files"][number]["changeType"]) ?? "CHANGED",
    })),
    bom: (dto.bom ?? []).map((bom) => ({
      lineNumber: bom.line_number ?? null,
      beforePartNumber: bom.before_part_number ?? null,
      beforeName: bom.before_name ?? null,
      beforeQuantity: bom.before_quantity ?? null,
      afterPartNumber: bom.after_part_number ?? null,
      afterName: bom.after_name ?? null,
      afterQuantity: bom.after_quantity ?? null,
      changeType: (bom.change_type as PartRevisionDiffModel["bom"][number]["changeType"]) ?? "CHANGED",
    })),
  };
}
