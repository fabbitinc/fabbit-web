import {
  cancelInvitation as cancelInvitationApiV1OrganizationsInvitationsInvitationIdDelete,
  createInvitation as createInvitationApiV1OrganizationsInvitationsPost,
  deleteProfileImage1 as deleteProfileImageApiV1OrganizationsProfileImageDelete,
  listInvitations as listInvitationsApiV1OrganizationsInvitationsGet,
  setProfileImage1 as setProfileImageApiV1OrganizationsProfileImagePut,
} from "@/api/generated/orval/organizations/organizations";
import {
  createLabel as createLabelApiV1LabelsPost,
  deleteLabel as deleteLabelApiV1LabelsLabelIdDelete,
  listLabels as listLabelsApiV1LabelsGet,
} from "@/api/generated/orval/labels/labels";
import {
  changeMemberRole as changeMemberRoleApiV1MembersUserIdRolePatch,
  listMembers as listOrgMembersApiV1MembersGet,
  removeMember as removeMemberApiV1MembersUserIdDelete,
} from "@/api/generated/orval/members/members";
import {
  listCategories as listCategoriesApiV1PartsCategoriesGet,
  renameCategory as renameCategoryApiV1PartsCategoriesCategoryPatch,
} from "@/api/generated/orval/parts/parts";
import {
  addTeamMembers as addTeamMembersApiV1TeamsTeamIdMembersPost,
  listTeamMembers as listTeamMembersApiV1TeamsTeamIdMembersGet,
  removeTeamMembers as removeTeamMembersApiV1TeamsTeamIdMembersDelete,
} from "@/api/generated/orval/team-members/team-members";
import {
  createTeam as createTeamApiV1TeamsPost,
  deleteTeam as deleteTeamApiV1TeamsTeamIdDelete,
  listTeams as listTeamsApiV1TeamsGet,
} from "@/api/generated/orval/teams/teams";
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
  OrganizationInvitationModel,
  OrganizationLabelModel,
  OrganizationMemberModel,
  OrganizationTeamModel,
  OrganizationUserSummaryModel,
} from "@/features/organization-settings/types/organization-settings-model";

export async function fetchOrganizationMembers() {
  const response = await listOrgMembersApiV1MembersGet();
  const members = response as MemberListResponseDto;

  return {
    items: members.items.map(toOrganizationMemberModel),
    maxMembers: members.max_members,
  };
}

export async function fetchOrganizationInvitations() {
  const response = await listInvitationsApiV1OrganizationsInvitationsGet();
  return (response as InvitationListResponseDto).invitations.map(toOrganizationInvitationModel);
}

export async function createOrganizationInvitation(request: CreateInvitationRequestDto) {
  const response = await createInvitationApiV1OrganizationsInvitationsPost(request);
  return toOrganizationInvitationModel(response as InvitationResponseDto);
}

export async function cancelOrganizationInvitation(invitationId: string) {
  await cancelInvitationApiV1OrganizationsInvitationsInvitationIdDelete(invitationId);
}

export async function removeOrganizationMember(userId: string) {
  await removeMemberApiV1MembersUserIdDelete(userId);
}

export async function changeOrganizationMemberRole(userId: string, request: ChangeMemberRoleRequestDto) {
  await changeMemberRoleApiV1MembersUserIdRolePatch(userId, request);
}

export async function setOrganizationProfileImage(request: SetProfileImageRequestDto) {
  return setProfileImageApiV1OrganizationsProfileImagePut(request);
}

export async function deleteOrganizationProfileImage() {
  await deleteProfileImageApiV1OrganizationsProfileImageDelete();
}

export async function fetchOrganizationTeams() {
  const response = await listTeamsApiV1TeamsGet();
  return (response as TeamListResponseDto).items.map(toOrganizationTeamModel);
}

export async function createOrganizationTeam(request: CreateTeamRequestDto) {
  await createTeamApiV1TeamsPost(request);
}

export async function deleteOrganizationTeam(teamId: string) {
  await deleteTeamApiV1TeamsTeamIdDelete(teamId);
}

export async function fetchOrganizationTeamMembers(teamId: string) {
  const response = await listTeamMembersApiV1TeamsTeamIdMembersGet(teamId);
  return (response as TeamMemberListResponseDto).items.map(toOrganizationUserSummaryModel);
}

export async function addOrganizationTeamMembers(teamId: string, request: AddTeamMembersRequestDto) {
  await addTeamMembersApiV1TeamsTeamIdMembersPost(teamId, request);
}

export async function removeOrganizationTeamMembers(teamId: string, request: RemoveTeamMembersRequestDto) {
  await removeTeamMembersApiV1TeamsTeamIdMembersDelete(teamId, request);
}

export async function fetchOrganizationCategories() {
  const response = await listCategoriesApiV1PartsCategoriesGet();
  return (response as CategoryStatsResponseDto).items.map((item) => ({
    category: item.category,
    partCount: item.part_count,
  } satisfies OrganizationCategoryModel));
}

export async function renameOrganizationCategory(category: string, request: RenameCategoryRequestDto) {
  await renameCategoryApiV1PartsCategoriesCategoryPatch(encodeURIComponent(category), request);
}

export async function fetchOrganizationLabels() {
  const response = await listLabelsApiV1LabelsGet();
  return (response as LabelListResponseDto).items.map(toOrganizationLabelModel);
}

export async function createOrganizationLabel(request: CreateLabelRequestDto) {
  const response = await createLabelApiV1LabelsPost(request);
  return toOrganizationLabelModel(response as LabelResponseDto);
}

export async function deleteOrganizationLabel(labelId: string) {
  await deleteLabelApiV1LabelsLabelIdDelete(labelId);
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
