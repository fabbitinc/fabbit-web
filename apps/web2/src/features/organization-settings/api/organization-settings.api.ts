import { apiClient } from "@/api/client";
import type {
  AddTeamMembersRequestDto,
  CategoryStatsResponseDto,
  ChangeMemberRoleRequestDto,
  CreateInvitationRequestDto,
  CreateLabelRequestDto,
  CreateTeamRequestDto,
  InvitationListResponseDto,
  InvitationResponseDto,
  LabelListResponseDto,
  LabelResponseDto,
  MemberListResponseDto,
  MemberSummaryDto,
  PartDefaultOwnerItemDto,
  PartDefaultOwnerListResponseDto,
  PartDefaultOwnerRequestDto,
  ProfileImageResponseDto,
  RemoveTeamMembersRequestDto,
  RenameCategoryRequestDto,
  SetProfileImageRequestDto,
  TeamListResponseDto,
  TeamMemberListResponseDto,
  TeamMemberSummaryDto,
  TeamSummaryDto,
  UserSummaryDto,
} from "@/features/organization-settings/api/organization-settings.types";
import type {
  OrganizationCategoryModel,
  OrganizationDefaultOwnerModel,
  OrganizationInvitationModel,
  OrganizationLabelModel,
  OrganizationMemberModel,
  OrganizationTeamModel,
  OrganizationUserSummaryModel,
} from "@/features/organization-settings/types/organization-settings-model";

export async function fetchOrganizationMembers() {
  const response = await apiClient.get<MemberListResponseDto>("/api/v1/members");
  return {
    items: response.data.items.map(toOrganizationMemberModel),
    maxMembers: response.data.max_members,
  };
}

export async function fetchOrganizationInvitations() {
  const response = await apiClient.get<InvitationListResponseDto>("/api/v1/organizations/invitations");
  return response.data.invitations.map(toOrganizationInvitationModel);
}

export async function createOrganizationInvitation(request: CreateInvitationRequestDto) {
  const response = await apiClient.post<InvitationResponseDto>("/api/v1/organizations/invitations", request);
  return toOrganizationInvitationModel(response.data);
}

export async function cancelOrganizationInvitation(invitationId: string) {
  await apiClient.delete(`/api/v1/organizations/invitations/${invitationId}`);
}

export async function removeOrganizationMember(userId: string) {
  await apiClient.delete(`/api/v1/members/${userId}`);
}

export async function changeOrganizationMemberRole(userId: string, request: ChangeMemberRoleRequestDto) {
  await apiClient.patch(`/api/v1/members/${userId}/role`, request);
}

export async function setOrganizationProfileImage(request: SetProfileImageRequestDto) {
  const response = await apiClient.put<ProfileImageResponseDto>("/api/v1/organizations/profile-image", request);
  return response.data;
}

export async function deleteOrganizationProfileImage() {
  await apiClient.delete("/api/v1/organizations/profile-image");
}

export async function fetchOrganizationTeams() {
  const response = await apiClient.get<TeamListResponseDto>("/api/v1/teams");
  return response.data.items.map(toOrganizationTeamModel);
}

export async function createOrganizationTeam(request: CreateTeamRequestDto) {
  await apiClient.post("/api/v1/teams", request);
}

export async function deleteOrganizationTeam(teamId: string) {
  await apiClient.delete(`/api/v1/teams/${teamId}`);
}

export async function fetchOrganizationTeamMembers(teamId: string) {
  const response = await apiClient.get<TeamMemberListResponseDto>(`/api/v1/teams/${teamId}/members`);
  return response.data.items.map(toOrganizationUserSummaryModel);
}

export async function addOrganizationTeamMembers(teamId: string, request: AddTeamMembersRequestDto) {
  await apiClient.post(`/api/v1/teams/${teamId}/members`, request);
}

export async function removeOrganizationTeamMembers(teamId: string, request: RemoveTeamMembersRequestDto) {
  await apiClient.delete(`/api/v1/teams/${teamId}/members`, {
    data: request,
  });
}

export async function fetchOrganizationCategories() {
  const response = await apiClient.get<CategoryStatsResponseDto>("/api/v1/parts/categories");
  return response.data.items.map((item) => ({
    category: item.category,
    partCount: item.part_count,
  } satisfies OrganizationCategoryModel));
}

export async function renameOrganizationCategory(category: string, request: RenameCategoryRequestDto) {
  await apiClient.patch(`/api/v1/parts/categories/${encodeURIComponent(category)}`, request);
}

export async function fetchOrganizationDefaultOwners() {
  const response = await apiClient.get<PartDefaultOwnerListResponseDto>("/api/v1/parts/owner/defaults");
  return response.data.items.map(toOrganizationDefaultOwnerModel);
}

export async function upsertOrganizationDefaultOwner(request: PartDefaultOwnerRequestDto) {
  const response = await apiClient.put<PartDefaultOwnerItemDto>("/api/v1/parts/owner/defaults", request);
  return toOrganizationDefaultOwnerModel(response.data);
}

export async function deleteOrganizationDefaultOwner(category?: string | null) {
  await apiClient.delete("/api/v1/parts/owner/defaults", {
    params: category != null ? { category } : undefined,
  });
}

export async function fetchOrganizationLabels() {
  const response = await apiClient.get<LabelListResponseDto>("/api/v1/labels");
  return response.data.items.map(toOrganizationLabelModel);
}

export async function createOrganizationLabel(request: CreateLabelRequestDto) {
  const response = await apiClient.post<LabelResponseDto>("/api/v1/labels", request);
  return toOrganizationLabelModel(response.data);
}

export async function deleteOrganizationLabel(labelId: string) {
  await apiClient.delete(`/api/v1/labels/${labelId}`);
}

function toOrganizationUserSummaryModel(user: UserSummaryDto | TeamMemberSummaryDto): OrganizationUserSummaryModel {
  return {
    userId: user.user_id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone ?? null,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toOrganizationMemberModel(member: MemberSummaryDto): OrganizationMemberModel {
  return {
    ...toOrganizationUserSummaryModel(member),
    role: member.role,
    jobRole: member.job_role ?? null,
  };
}

function toOrganizationInvitationModel(invitation: InvitationResponseDto): OrganizationInvitationModel {
  return {
    id: invitation.id,
    orgId: invitation.org_id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    invitedBy: invitation.invited_by,
    expiresAt: invitation.expires_at,
    acceptedAt: invitation.accepted_at ?? null,
    createdAt: invitation.created_at,
  };
}

function toOrganizationTeamModel(team: TeamSummaryDto): OrganizationTeamModel {
  return {
    id: team.id,
    name: team.name,
    description: team.description ?? null,
    memberCount: team.member_count,
    createdBy: team.created_by,
    createdAt: team.created_at,
  };
}

function toOrganizationDefaultOwnerModel(item: PartDefaultOwnerItemDto): OrganizationDefaultOwnerModel {
  return {
    id: item.id,
    category: item.category ?? null,
    defaultOwnerId: item.default_owner_id ?? null,
    defaultOwner: item.default_owner ? toOrganizationUserSummaryModel(item.default_owner) : null,
    defaultOwnerTeamId: item.default_owner_team_id ?? null,
    defaultOwnerTeamName: item.default_owner_team_name ?? null,
  };
}

function toOrganizationLabelModel(label: LabelResponseDto): OrganizationLabelModel {
  return {
    id: label.id,
    name: label.name,
    description: label.description ?? null,
    color: label.color,
    createdAt: label.created_at,
    createdBy: label.created_by ?? null,
  };
}
