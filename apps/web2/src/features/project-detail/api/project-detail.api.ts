import { apiClient } from "@/api/client";
import type {
  AddProjectMembersRequestDto,
  AddProjectMembersResponseDto,
  ProjectActivitiesQueryDto,
  ProjectActivitiesResponseDto,
  ProjectDetailResponseDto,
  ProjectMemberListResponseDto,
  ProjectMemberLookupQueryDto,
  ProjectMemberLookupResponseDto,
  ProjectPartLookupQueryDto,
  ProjectPartLookupResponseDto,
  ProjectPartsQueryDto,
  ProjectPartsResponseDto,
  LinkProjectPartsRequestDto,
  LinkProjectPartsResponseDto,
  RemoveProjectMembersRequestDto,
  UnlinkProjectPartsRequestDto,
  UpdateProjectRequestDto,
} from "@/features/project-detail/api/project-detail.types";
import type {
  ProjectActivitiesResultModel,
  ProjectActivityActorModel,
  ProjectActivityItemModel,
  ProjectDetailModel,
  ProjectMemberModel,
  ProjectPartModel,
  ProjectPartsResultModel,
  ProjectUserLookupModel,
} from "@/features/project-detail/types/project-detail-model";

export async function fetchProjectDetail(projectId: string): Promise<ProjectDetailModel> {
  const response = await apiClient.get<ProjectDetailResponseDto>(`/api/v1/projects/${projectId}`);
  return toProjectDetailModel(response.data);
}

export async function updateProject(projectId: string, request: UpdateProjectRequestDto): Promise<ProjectDetailModel> {
  const response = await apiClient.patch<ProjectDetailResponseDto>(`/api/v1/projects/${projectId}`, request);
  return toProjectDetailModel(response.data);
}

export async function archiveProject(projectId: string) {
  await apiClient.post(`/api/v1/projects/${projectId}/archive`);
}

export async function unarchiveProject(projectId: string) {
  await apiClient.post(`/api/v1/projects/${projectId}/unarchive`);
}

export async function deleteProject(projectId: string) {
  await apiClient.delete(`/api/v1/projects/${projectId}`);
}

export async function fetchProjectActivities(
  projectId: string,
  query: ProjectActivitiesQueryDto,
): Promise<ProjectActivitiesResultModel> {
  const response = await apiClient.get<ProjectActivitiesResponseDto>(`/api/v1/projects/${projectId}/activities`, {
    params: query,
  });

  return {
    items: response.data.items.map((item) => toProjectActivityItemModel(item, response.data.users)),
    nextCursor: response.data.next_cursor ?? null,
  };
}

export async function fetchProjectMembers(projectId: string): Promise<ProjectMemberModel[]> {
  const response = await apiClient.get<ProjectMemberListResponseDto>(`/api/v1/projects/${projectId}/members`);
  return response.data.items.map(toProjectMemberModel);
}

export async function lookupProjectMembers(
  projectId: string,
  query: ProjectMemberLookupQueryDto,
): Promise<ProjectUserLookupModel[]> {
  const response = await apiClient.get<ProjectMemberLookupResponseDto>(`/api/v1/projects/${projectId}/members/lookup`, {
    params: query,
  });

  return response.data.items.map(toProjectUserLookupModel);
}

export async function addProjectMembers(
  projectId: string,
  request: AddProjectMembersRequestDto,
): Promise<AddProjectMembersResponseDto> {
  const response = await apiClient.post<AddProjectMembersResponseDto>(`/api/v1/projects/${projectId}/members`, request);
  return response.data;
}

export async function removeProjectMembers(projectId: string, request: RemoveProjectMembersRequestDto) {
  await apiClient.delete(`/api/v1/projects/${projectId}/members`, {
    data: request,
  });
}

export async function fetchProjectParts(
  projectId: string,
  query: ProjectPartsQueryDto,
): Promise<ProjectPartsResultModel> {
  const response = await apiClient.get<ProjectPartsResponseDto>(`/api/v1/projects/${projectId}/parts`, {
    params: query,
  });

  return {
    total: response.data.total,
    items: response.data.items.map(toProjectPartModel),
  };
}

export async function lookupProjectParts(
  projectId: string,
  query: ProjectPartLookupQueryDto,
): Promise<ProjectPartModel[]> {
  const response = await apiClient.get<ProjectPartLookupResponseDto>(`/api/v1/projects/${projectId}/parts/lookup`, {
    params: query,
  });

  return response.data.items.map(toProjectPartModel);
}

export async function linkProjectParts(
  projectId: string,
  request: LinkProjectPartsRequestDto,
): Promise<LinkProjectPartsResponseDto> {
  const response = await apiClient.post<LinkProjectPartsResponseDto>(`/api/v1/projects/${projectId}/parts`, request);
  return response.data;
}

export async function unlinkProjectParts(projectId: string, request: UnlinkProjectPartsRequestDto) {
  await apiClient.delete(`/api/v1/projects/${projectId}/parts`, {
    data: request,
  });
}

function toProjectDetailModel(project: ProjectDetailResponseDto): ProjectDetailModel {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    partCount: project.part_count,
    isArchived: project.is_archived,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  };
}

function toProjectMemberModel(member: ProjectMemberListResponseDto["items"][number]): ProjectMemberModel {
  return {
    userId: member.user_id,
    fullName: member.full_name,
    email: member.email,
    phone: member.phone ?? null,
    profileImageUrl: member.profile_image_url ?? null,
    role: member.role as ProjectMemberModel["role"],
  };
}

function toProjectUserLookupModel(user: ProjectMemberLookupResponseDto["items"][number]): ProjectUserLookupModel {
  return {
    userId: user.user_id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone ?? null,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toProjectPartModel(
  part: ProjectPartsResponseDto["items"][number] | ProjectPartLookupResponseDto["items"][number],
): ProjectPartModel {
  return {
    id: part.id,
    partNumber: part.part_number,
    name: part.name ?? null,
  };
}

function toProjectActivityActorModel(
  actor: ProjectActivitiesResponseDto["users"][string] | undefined,
): ProjectActivityActorModel | null {
  if (!actor) {
    return null;
  }

  return {
    userId: actor.user_id,
    fullName: actor.full_name,
    email: actor.email,
    profileImageUrl: actor.profile_image_url ?? null,
  };
}

function toProjectActivityItemModel(
  item: ProjectActivitiesResponseDto["items"][number],
  users: ProjectActivitiesResponseDto["users"],
): ProjectActivityItemModel {
  return {
    id: item.id,
    action: item.action,
    scope: item.scope ?? null,
    actorId: item.actor_id,
    actor: toProjectActivityActorModel(users[item.actor_id]),
    createdAt: item.created_at,
  };
}
