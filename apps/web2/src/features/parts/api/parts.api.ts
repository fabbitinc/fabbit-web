import { apiClient } from "@/api/client";
import { listMembers as listOrgMembersApiV1MembersGet } from "@/api/generated/orval/members/members";
import {
  getPartOwner as getPartOwnerApiV1PartsPartIdOwnerGet,
  updatePartOwner as updatePartOwnerApiV1PartsPartIdOwnerPatch,
} from "@/api/generated/orval/part-owner/part-owner";
import {
  linkParts as linkPartsToProjectApiV1ProjectsProjectIdPartsPost,
} from "@/api/generated/orval/project-parts/project-parts";
import { listProjects as listProjectsApiV1ProjectsGet } from "@/api/generated/orval/projects/projects";
import {
  attachFiles as attachFilesApiV1PartsPartIdFilesPost,
  deleteDrawingFromPart as deleteDrawingFromPartApiV1PartsPartIdDrawingsDelete,
  detachFile as detachFileApiV1PartsPartIdFilesFileIdDelete,
  exportBomTree as exportBomApiV1PartsPartIdBomTreeExportGet,
  exportParts as exportPartsApiV1PartsExportGet,
  getBomTree as getBomTreeApiV1PartsPartIdBomTreeGet,
  getFilterOptions as getFilterOptionsApiV1PartsFilterOptionsGet,
  getPart as getPartApiV1PartsPartIdGet,
  getPartBom as getPartBomApiV1PartsPartIdBomGet,
  getPartFiles as getPartFilesApiV1PartsPartIdFilesGet,
  getPartProjects as getPartProjectsApiV1PartsPartIdProjectsGet,
  getPartSuppliers as getPartSuppliersApiV1PartsPartIdSuppliersGet,
  listParts as listPartsApiV1PartsGet,
  registerDrawingForPart as registerDrawingForPartApiV1PartsPartIdDrawingsPost,
} from "@/api/generated/orval/parts/parts";
import { listTeams as listTeamsApiV1TeamsGet } from "@/api/generated/orval/teams/teams";
import type {
  AttachPartFilesRequestDto,
  AttachPartFilesResponseDto,
  ExportPartBomTreeQueryDto,
  ExportPartsQueryDto,
  LinkProjectPartsRequestDto,
  LinkProjectPartsResponseDto,
  PartBomTreeQueryDto,
  PartBomTreeResponseDto,
  ListPartsQueryDto,
  ListProjectsQueryDto,
  MemberListResponseDto,
  PartBomResponseDto,
  PartDetailResponseDto,
  DrawingProcessingResponseDto,
  PartFilesResponseDto,
  PartListResponseDto,
  PartOwnerResponseDto,
  PartProjectsResponseDto,
  PartSuppliersResponseDto,
  ProjectListResponseDto,
  RegisterPartDrawingRequestDto,
  RegisterPartDrawingResponseDto,
  UpdatePartOwnerRequestDto,
} from "@/features/parts/api/parts.types";
import type {
  PartBomItemModel,
  PartBomModel,
  PartBomTreeModel,
  PartBomTreeNodeModel,
  PartDetailModel,
  PartDrawingModel,
  PartDrawingProcessingModel,
  PartFileModel,
  PartFilterOptionsModel,
  PartListItemModel,
  PartListResultModel,
  PartOwnerModel,
  PartOwnerUserModel,
  PartProjectModel,
  PartsAvailableProjectModel,
  PartsAvailableTeamModel,
  PartSupplierModel,
} from "@/features/parts/types/parts-model";

export async function fetchPartsList(query: ListPartsQueryDto): Promise<PartListResultModel> {
  const response = await listPartsApiV1PartsGet(query);
  const result = response as PartListResponseDto;

  return {
    total: result.total,
    offset: result.offset,
    limit: result.limit,
    items: result.items.map(toPartListItemModel),
  };
}

export async function fetchPartFilterOptions(): Promise<PartFilterOptionsModel> {
  const response = await getFilterOptionsApiV1PartsFilterOptionsGet();

  return {
    categories: response.categories,
    lifecycleStates: response.lifecycle_states,
  };
}

export async function fetchPartDetail(partId: string): Promise<PartDetailModel> {
  const response = await getPartApiV1PartsPartIdGet(partId);
  return toPartDetailModel(response as PartDetailResponseDto);
}

export async function fetchPartBom(partId: string): Promise<PartBomModel> {
  const response = await getPartBomApiV1PartsPartIdBomGet(partId);
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
  const response = await getBomTreeApiV1PartsPartIdBomTreeGet(partId, query);
  const tree = response as PartBomTreeResponseDto;

  return {
    root: toPartBomTreeNodeModel(tree.root),
    direction: tree.direction === "REVERSE" ? "reverse" : "forward",
    totalCount: tree.total_count,
  };
}

export async function fetchPartSuppliers(partId: string): Promise<PartSupplierModel[]> {
  const response = await getPartSuppliersApiV1PartsPartIdSuppliersGet(partId);
  const suppliers = response as PartSuppliersResponseDto;
  return suppliers.items.map((supplier) => ({
    id: supplier.id,
    companyName: supplier.company_name,
    code: supplier.code ?? null,
    country: supplier.country ?? null,
    unitCost: supplier.unit_cost ?? null,
  }));
}

export async function fetchPartFiles(partId: string): Promise<PartFileModel[]> {
  const response = await getPartFilesApiV1PartsPartIdFilesGet(partId);
  const files = response as PartFilesResponseDto;
  return files.items.map(toPartFileModel);
}

export async function attachPartFiles(partId: string, request: AttachPartFilesRequestDto): Promise<PartFileModel[]> {
  const response = await attachFilesApiV1PartsPartIdFilesPost(partId, request);
  return (response as AttachPartFilesResponseDto).map(toPartFileModel);
}

export async function detachPartFile(partId: string, fileId: string) {
  await detachFileApiV1PartsPartIdFilesFileIdDelete(partId, fileId);
}

export async function fetchPartProjects(partId: string): Promise<PartProjectModel[]> {
  const response = await getPartProjectsApiV1PartsPartIdProjectsGet(partId);
  const projects = response as { items: PartProjectsResponseDto["items"] };
  return projects.items.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description ?? null,
  }));
}

export async function fetchPartOwner(partId: string): Promise<PartOwnerModel> {
  const response = await getPartOwnerApiV1PartsPartIdOwnerGet(partId);
  return toPartOwnerModel(response as PartOwnerResponseDto);
}

export async function updatePartOwner(partId: string, request: UpdatePartOwnerRequestDto): Promise<PartOwnerModel> {
  const response = await updatePartOwnerApiV1PartsPartIdOwnerPatch(partId, request);
  return toPartOwnerModel(response as PartOwnerResponseDto);
}

export async function registerPartDrawing(partId: string, request: RegisterPartDrawingRequestDto): Promise<PartDrawingModel> {
  const response = await registerDrawingForPartApiV1PartsPartIdDrawingsPost(partId, request);
  return toPartDrawingModel(response as RegisterPartDrawingResponseDto);
}

export async function fetchDrawingProcessing(drawingId: string): Promise<PartDrawingProcessingModel> {
  const response = await apiClient.get<DrawingProcessingResponseDto>(`/api/v1/drawings/${drawingId}/processing`);
  const processing = response.data;

  return {
    status: processing.status ?? "PENDING",
    failureReason: processing.failure_reason ?? null,
    pdfReady: processing.pdf_ready ?? false,
    webpReady: processing.webp_ready ?? false,
    glbReady: processing.glb_ready ?? false,
  };
}

export async function deletePartDrawing(partId: string) {
  await deleteDrawingFromPartApiV1PartsPartIdDrawingsDelete(partId);
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

export async function fetchAssignableMembers(): Promise<PartOwnerUserModel[]> {
  const response = await listOrgMembersApiV1MembersGet();
  return response.items.map(toPartOwnerUserModel);
}

export async function fetchAssignableTeams(): Promise<PartsAvailableTeamModel[]> {
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
  const response = await exportBomApiV1PartsPartIdBomTreeExportGet(partId, query, {
    responseType: "blob",
  });

  return response as Blob;
}

function toPartListItemModel(part: PartListResponseDto["items"][number]): PartListItemModel {
  return {
    id: part.id,
    partNumber: part.part_number,
    name: part.name ?? null,
    category: part.category ?? null,
    revision: part.revision,
    lifecycleState: part.lifecycle_state ?? null,
    drawingNumber: part.drawing_number ?? null,
    childrenCount: part.children_count,
  };
}

function toPartDetailModel(part: PartDetailResponseDto): PartDetailModel {
  return {
    id: part.id,
    partNumber: part.part_number,
    name: part.name ?? null,
    revision: part.revision,
    material: part.material ?? null,
    unit: part.unit ?? null,
    description: part.description ?? null,
    category: part.category ?? null,
    lifecycleState: part.lifecycle_state ?? null,
    isPhantom: part.is_phantom ?? null,
    leadTimeDays: part.lead_time_days ?? null,
    extendedProperties: part.extended_properties,
    ownerId: part.owner_id ?? null,
    owner: part.owner ? toPartOwnerUserModel(part.owner) : null,
    ownerTeamId: part.owner_team_id ?? null,
    ownerTeamName: part.owner_team_name ?? null,
    drawing: part.drawing ? toPartDrawingModel(part.drawing) : null,
    childrenCount: part.children_count,
    parentsCount: part.parents_count,
    suppliersCount: part.suppliers_count,
    filesCount: part.files_count,
    projectsCount: part.projects_count,
  };
}

function toPartOwnerUserModel(
  user: NonNullable<PartDetailResponseDto["owner"]> | MemberListResponseDto["items"][number],
): PartOwnerUserModel {
  return {
    userId: user.user_id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone ?? null,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toPartDrawingModel(
  drawing: NonNullable<PartDetailResponseDto["drawing"]> | RegisterPartDrawingResponseDto,
): PartDrawingModel {
  return {
    id: "drawing_id" in drawing ? drawing.drawing_id : drawing.id,
    drawingNumber: drawing.drawing_number ?? null,
    name: drawing.name ?? null,
    version: "version" in drawing ? (drawing.version ?? null) : null,
    status: "status" in drawing ? (drawing.status ?? null) : null,
    conversionStatus: drawing.conversion_status ?? null,
    thumbnailUrl: "thumbnail_url" in drawing ? (drawing.thumbnail_url ?? null) : null,
    pdfUrl: "pdf_url" in drawing ? (drawing.pdf_url ?? null) : null,
    originalFileUrl: "original_file_url" in drawing ? (drawing.original_file_url ?? null) : null,
  };
}

function toPartBomItemModel(item: PartBomResponseDto["children"][number] | PartBomResponseDto["parents"][number]): PartBomItemModel {
  return {
    id: item.id,
    partNumber: item.part_number,
    name: item.name ?? null,
    quantity: item.quantity,
    extendedProperties: item.extended_properties,
  };
}

function toPartBomTreeNodeModel(node: PartBomTreeResponseDto["root"]): PartBomTreeNodeModel {
  return {
    id: node.id,
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

function toPartFileModel(file: PartFilesResponseDto["items"][number] | AttachPartFilesResponseDto[number]): PartFileModel {
  return {
    fileId: file.file_id,
    originalName: file.original_name,
    contentType: file.content_type,
    fileSize: file.file_size,
    fileUrl: file.file_url ?? null,
    createdAt: file.created_at,
  };
}

function toPartOwnerModel(owner: PartOwnerResponseDto): PartOwnerModel {
  return {
    ownerId: owner.owner_id ?? null,
    owner: owner.owner ? toPartOwnerUserModel(owner.owner) : null,
    ownerTeamId: owner.owner_team_id ?? null,
    ownerTeamName: owner.owner_team_name ?? null,
  };
}
