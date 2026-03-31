import {
  projectMemberAdd as addProjectMembersApiV1ProjectsProjectIdMembersPost,
  projectMemberList as listProjectMembersApiV1ProjectsProjectIdMembersGet,
  projectMemberLookupMembers as lookupMembersApiV1ProjectsProjectIdMembersLookupGet,
  projectMemberRemove as removeProjectMembersApiV1ProjectsProjectIdMembersDelete,
} from "@/api/generated/orval/project-members/project-members";
import {
  projectPartGet as getProjectPartsApiV1ProjectsProjectIdPartsGet,
  projectPartLinkParts as linkPartsToProjectApiV1ProjectsProjectIdPartsPost,
  projectPartLookupParts as lookupPartsApiV1ProjectsProjectIdPartsLookupGet,
  projectPartUnlinkParts as unlinkPartsFromProjectApiV1ProjectsProjectIdPartsDelete,
} from "@/api/generated/orval/project-parts/project-parts";
import {
  projectArchive as archiveProjectApiV1ProjectsProjectIdArchivePost,
  projectDelete as deleteProjectApiV1ProjectsProjectIdDelete,
  projectGet as getProjectApiV1ProjectsProjectIdGet,
  projectGetProjectActivities as getProjectActivitiesApiV1ProjectsProjectIdActivitiesGet,
  projectUnarchive as unarchiveProjectApiV1ProjectsProjectIdUnarchivePost,
  projectUpdate as updateProjectApiV1ProjectsProjectIdPatch,
} from "@/api/generated/orval/projects/projects";
import { apiClient } from "@/api/client";
import type {
  AddProjectMembersRequestDto,
  AddProjectMembersResponseDto,
  ProjectChangeListResponseDto,
  ProjectActivitiesQueryDto,
  ProjectActivitiesResponseDto,
  ProjectDetailResponseDto,
  ProjectIssueListResponseDto,
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
  ProjectChangeListItemModel,
  ProjectChangeListResultModel,
  ProjectDetailModel,
  ProjectIssueListItemModel,
  ProjectIssueListResultModel,
  ProjectMemberModel,
  ProjectPartModel,
  ProjectPartsResultModel,
  ProjectWorkItemLabelModel,
  ProjectWorkItemUserModel,
  ProjectUserLookupModel,
} from "@/features/project-detail/types/project-detail-model";

export async function fetchProjectDetail(projectId: string): Promise<ProjectDetailModel> {
  const response = await getProjectApiV1ProjectsProjectIdGet(projectId);
  return toProjectDetailModel(response);
}

export async function updateProject(projectId: string, request: UpdateProjectRequestDto): Promise<ProjectDetailModel> {
  const response = await updateProjectApiV1ProjectsProjectIdPatch(projectId, request);
  return toProjectDetailModel(response);
}

export async function archiveProject(projectId: string) {
  await archiveProjectApiV1ProjectsProjectIdArchivePost(projectId);
}

export async function unarchiveProject(projectId: string) {
  await unarchiveProjectApiV1ProjectsProjectIdUnarchivePost(projectId);
}

export async function deleteProject(projectId: string) {
  await deleteProjectApiV1ProjectsProjectIdDelete(projectId);
}

export async function fetchProjectActivities(
  projectId: string,
  query: ProjectActivitiesQueryDto,
): Promise<ProjectActivitiesResultModel> {
  const response = await getProjectActivitiesApiV1ProjectsProjectIdActivitiesGet(projectId, query);
  const activities = response as ProjectActivitiesResponseDto;
  const users = activities.users ?? {};

  return {
    items: (activities.items ?? []).map((item) => toProjectActivityItemModel(item, users)),
    nextCursor: activities.next_cursor ?? null,
  };
}

export async function fetchProjectIssues(projectId: string): Promise<ProjectIssueListResultModel> {
  const response = await apiClient.get<ProjectIssueListResponseDto>(`/api/v1/projects/${projectId}/issues`);
  const payload = response.data;

  return {
    openCount: payload.open_count ?? 0,
    closedCount: payload.closed_count ?? 0,
    total: payload.total ?? payload.items.length,
    items: payload.items.map(toProjectIssueListItemModel),
  };
}

export async function fetchProjectChanges(projectId: string): Promise<ProjectChangeListResultModel> {
  const response = await apiClient.get<ProjectChangeListResponseDto>(`/api/v1/projects/${projectId}/changes`);
  const payload = response.data;

  return {
    openCount: payload.open_count ?? 0,
    closedCount: payload.closed_count ?? 0,
    total: payload.total ?? payload.items.length,
    items: payload.items.map(toProjectChangeListItemModel),
  };
}

export async function fetchProjectMembers(projectId: string): Promise<ProjectMemberModel[]> {
  const response = await listProjectMembersApiV1ProjectsProjectIdMembersGet(projectId);
  return response.items.map(toProjectMemberModel);
}

export async function lookupProjectMembers(
  projectId: string,
  query: ProjectMemberLookupQueryDto,
): Promise<ProjectUserLookupModel[]> {
  const response = await lookupMembersApiV1ProjectsProjectIdMembersLookupGet(projectId, query);

  return response.items.map(toProjectUserLookupModel);
}

export async function addProjectMembers(
  projectId: string,
  request: AddProjectMembersRequestDto,
): Promise<AddProjectMembersResponseDto> {
  return addProjectMembersApiV1ProjectsProjectIdMembersPost(projectId, request);
}

export async function removeProjectMembers(projectId: string, request: RemoveProjectMembersRequestDto) {
  await removeProjectMembersApiV1ProjectsProjectIdMembersDelete(projectId, request);
}

export async function fetchProjectParts(
  projectId: string,
  query: ProjectPartsQueryDto,
): Promise<ProjectPartsResultModel> {
  const response = await getProjectPartsApiV1ProjectsProjectIdPartsGet(projectId, query);

  return {
    total: response.total,
    items: response.items.map(toProjectPartModel),
  };
}

export async function lookupProjectParts(
  projectId: string,
  query: ProjectPartLookupQueryDto,
): Promise<ProjectPartModel[]> {
  const response = await lookupPartsApiV1ProjectsProjectIdPartsLookupGet(projectId, query);

  return response.items.map(toProjectPartModel);
}

export async function linkProjectParts(
  projectId: string,
  request: LinkProjectPartsRequestDto,
): Promise<LinkProjectPartsResponseDto> {
  return linkPartsToProjectApiV1ProjectsProjectIdPartsPost(projectId, request);
}

export async function unlinkProjectParts(projectId: string, request: UnlinkProjectPartsRequestDto) {
  await unlinkPartsFromProjectApiV1ProjectsProjectIdPartsDelete(projectId, request);
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

function toProjectWorkItemLabelModel(label: { id: string; name: string; color: string }): ProjectWorkItemLabelModel {
  return {
    id: label.id,
    name: label.name,
    color: label.color,
  };
}

function toProjectWorkItemUserModel(user: {
  user_id: string;
  full_name: string;
  profile_image_url?: string | null;
}): ProjectWorkItemUserModel {
  return {
    userId: user.user_id,
    fullName: user.full_name,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toProjectIssueListItemModel(item: ProjectIssueListResponseDto["items"][number]): ProjectIssueListItemModel {
  return {
    id: item.id,
    number: item.number,
    title: item.title,
    state: item.state,
    createdAt: item.created_at,
    commentsCount: item.comments_count,
    createdByName: item.created_by?.full_name ?? "삭제된 사용자",
    createdByProfileImageUrl: item.created_by?.profile_image_url ?? null,
    labels: item.labels.map(toProjectWorkItemLabelModel),
    assignees: item.assignees.map(toProjectWorkItemUserModel),
  };
}

function toProjectChangeListItemModel(
  item: ProjectChangeListResponseDto["items"][number],
): ProjectChangeListItemModel {
  return {
    id: item.id,
    number: item.number,
    title: item.title,
    engineeringChangeState: item.state,
    createdAt: item.created_at,
    commentsCount: item.comments_count,
    createdByName: item.created_by?.full_name ?? "삭제된 사용자",
    createdByProfileImageUrl: item.created_by?.profile_image_url ?? null,
    labels: [],
    assignees: [],
  };
}

function toProjectActivityActorModel(
  actor: NonNullable<ProjectActivitiesResponseDto["users"]>[string] | undefined,
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
  item: NonNullable<ProjectActivitiesResponseDto["items"]>[number],
  users: NonNullable<ProjectActivitiesResponseDto["users"]>,
): ProjectActivityItemModel {
  const actorId = item.actor_id ?? "";

  return {
    id: item.id ?? "",
    action: item.action ?? "",
    scope: item.scope ?? null,
    actorId,
    actor: actorId ? toProjectActivityActorModel(users[actorId]) : null,
    createdAt: item.created_at ?? "",
  };
}
