import { apiClient } from "@/api/client";
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
  PartFilesResponseDto,
  PartFilterOptionsResponseDto,
  PartListResponseDto,
  PartOwnerResponseDto,
  PartProjectsResponseDto,
  PartSuppliersResponseDto,
  ProjectListResponseDto,
  RegisterPartDrawingRequestDto,
  RegisterPartDrawingResponseDto,
  TeamListResponseDto,
  UpdatePartOwnerRequestDto,
} from "@/features/parts/api/parts.types";
import type {
  PartBomItemModel,
  PartBomModel,
  PartBomTreeModel,
  PartBomTreeNodeModel,
  PartDetailModel,
  PartDrawingModel,
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
  const response = await apiClient.get<PartListResponseDto>("/api/v1/parts", {
    params: query,
  });

  return {
    total: response.data.total,
    offset: response.data.offset,
    limit: response.data.limit,
    items: response.data.items.map(toPartListItemModel),
  };
}

export async function fetchPartFilterOptions(): Promise<PartFilterOptionsModel> {
  const response = await apiClient.get<PartFilterOptionsResponseDto>("/api/v1/parts/filter-options");

  return {
    categories: response.data.categories,
    lifecycleStates: response.data.lifecycle_states,
  };
}

export async function fetchPartDetail(partId: string): Promise<PartDetailModel> {
  const response = await apiClient.get<PartDetailResponseDto>(`/api/v1/parts/${partId}`);
  return toPartDetailModel(response.data);
}

export async function fetchPartBom(partId: string): Promise<PartBomModel> {
  const response = await apiClient.get<PartBomResponseDto>(`/api/v1/parts/${partId}/bom`);

  return {
    children: response.data.children.map(toPartBomItemModel),
    parents: response.data.parents.map(toPartBomItemModel),
  };
}

export async function fetchPartBomTree(
  partId: string,
  query: PartBomTreeQueryDto,
): Promise<PartBomTreeModel> {
  const response = await apiClient.get<PartBomTreeResponseDto>(`/api/v1/parts/${partId}/bom/tree`, {
    params: query,
  });

  return {
    root: toPartBomTreeNodeModel(response.data.root),
    direction: response.data.direction === "reverse" ? "reverse" : "forward",
    totalCount: response.data.total_count,
  };
}

export async function fetchPartSuppliers(partId: string): Promise<PartSupplierModel[]> {
  const response = await apiClient.get<PartSuppliersResponseDto>(`/api/v1/parts/${partId}/suppliers`);
  return response.data.items.map((supplier) => ({
    id: supplier.id,
    companyName: supplier.company_name,
    code: supplier.code ?? null,
    country: supplier.country ?? null,
    unitCost: supplier.unit_cost ?? null,
  }));
}

export async function fetchPartFiles(partId: string): Promise<PartFileModel[]> {
  const response = await apiClient.get<PartFilesResponseDto>(`/api/v1/parts/${partId}/files`);
  return response.data.items.map(toPartFileModel);
}

export async function attachPartFiles(partId: string, request: AttachPartFilesRequestDto): Promise<PartFileModel[]> {
  const response = await apiClient.post<AttachPartFilesResponseDto>(`/api/v1/parts/${partId}/files`, request);
  return response.data.map(toPartFileModel);
}

export async function detachPartFile(partId: string, fileId: string) {
  await apiClient.delete(`/api/v1/parts/${partId}/files/${fileId}`);
}

export async function fetchPartProjects(partId: string): Promise<PartProjectModel[]> {
  const response = await apiClient.get<PartProjectsResponseDto>(`/api/v1/parts/${partId}/projects`);
  return response.data.items.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description ?? null,
  }));
}

export async function fetchPartOwner(partId: string): Promise<PartOwnerModel> {
  const response = await apiClient.get<PartOwnerResponseDto>(`/api/v1/parts/${partId}/owner`);
  return toPartOwnerModel(response.data);
}

export async function updatePartOwner(partId: string, request: UpdatePartOwnerRequestDto): Promise<PartOwnerModel> {
  const response = await apiClient.patch<PartOwnerResponseDto>(`/api/v1/parts/${partId}/owner`, request);
  return toPartOwnerModel(response.data);
}

export async function registerPartDrawing(partId: string, request: RegisterPartDrawingRequestDto): Promise<PartDrawingModel> {
  const response = await apiClient.post<RegisterPartDrawingResponseDto>(`/api/v1/parts/${partId}/drawings`, request);
  return toPartDrawingModel(response.data);
}

export async function deletePartDrawing(partId: string) {
  await apiClient.delete(`/api/v1/parts/${partId}/drawings`);
}

export async function fetchAvailableProjects(query: ListProjectsQueryDto): Promise<PartsAvailableProjectModel[]> {
  const response = await apiClient.get<ProjectListResponseDto>("/api/v1/projects", {
    params: query,
  });

  return response.data.items.map((project) => ({
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
  const response = await apiClient.post<LinkProjectPartsResponseDto>(`/api/v1/projects/${projectId}/parts`, request);
  return response.data;
}

export async function fetchTeamLookup(): Promise<PartsAvailableTeamModel[]> {
  const response = await apiClient.get<TeamListResponseDto>("/api/v1/teams");
  return response.data.items.map((team) => ({
    id: team.id,
    name: team.name,
    memberCount: team.member_count,
  }));
}

export async function fetchAssignableMembers(): Promise<PartOwnerUserModel[]> {
  const response = await apiClient.get<MemberListResponseDto>("/api/v1/members");
  return response.data.items.map(toPartOwnerUserModel);
}

export async function fetchAssignableTeams(): Promise<PartsAvailableTeamModel[]> {
  const response = await apiClient.get<TeamListResponseDto>("/api/v1/teams");
  return response.data.items.map((team) => ({
    id: team.id,
    name: team.name,
    memberCount: team.member_count,
  }));
}

export async function exportParts(query: ExportPartsQueryDto): Promise<Blob> {
  const response = await apiClient.get("/api/v1/parts/export", {
    params: query,
    responseType: "blob",
  });

  return response.data as Blob;
}

export async function exportPartBomTree(partId: string, query: ExportPartBomTreeQueryDto): Promise<Blob> {
  const response = await apiClient.get(`/api/v1/parts/${partId}/bom/tree/export`, {
    params: query,
    responseType: "blob",
  });

  return response.data as Blob;
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
