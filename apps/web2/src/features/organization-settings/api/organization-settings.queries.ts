import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  addOrganizationTeamMembers,
  cancelOrganizationInvitation,
  changeOrganizationMemberRole,
  createOrganizationInvitation,
  createOrganizationLabel,
  createOrganizationTeam,
  deleteOrganizationDefaultOwner,
  deleteOrganizationLabel,
  deleteOrganizationProfileImage,
  deleteOrganizationTeam,
  fetchOrganizationCategories,
  fetchOrganizationDefaultOwners,
  fetchOrganizationInvitations,
  fetchOrganizationLabels,
  fetchOrganizationMembers,
  fetchOrganizationTeamMembers,
  fetchOrganizationTeams,
  removeOrganizationMember,
  removeOrganizationTeamMembers,
  renameOrganizationCategory,
  setOrganizationProfileImage,
  upsertOrganizationDefaultOwner,
} from "@/features/organization-settings/api/organization-settings.api";
import type {
  ChangeMemberRoleRequestDto,
  CreateInvitationRequestDto,
  CreateLabelRequestDto,
  CreateTeamRequestDto,
  PartDefaultOwnerRequestDto,
  RenameCategoryRequestDto,
  SetProfileImageRequestDto,
} from "@/features/organization-settings/api/organization-settings.types";

export const organizationSettingsKeys = {
  members: ["organization-settings", "members"] as const,
  invitations: ["organization-settings", "invitations"] as const,
  teams: ["organization-settings", "teams"] as const,
  teamMembers: (teamId: string) => ["organization-settings", "teams", teamId, "members"] as const,
  categories: ["organization-settings", "parts", "categories"] as const,
  defaultOwners: ["organization-settings", "parts", "default-owners"] as const,
  labels: ["organization-settings", "change", "labels"] as const,
};

export const organizationSettingsQueries = {
  members: () =>
    queryOptions({
      queryKey: organizationSettingsKeys.members,
      queryFn: fetchOrganizationMembers,
      staleTime: 30_000,
    }),
  invitations: () =>
    queryOptions({
      queryKey: organizationSettingsKeys.invitations,
      queryFn: fetchOrganizationInvitations,
      staleTime: 30_000,
    }),
  teams: () =>
    queryOptions({
      queryKey: organizationSettingsKeys.teams,
      queryFn: fetchOrganizationTeams,
      staleTime: 30_000,
    }),
  teamMembers: (teamId: string) =>
    queryOptions({
      queryKey: organizationSettingsKeys.teamMembers(teamId),
      queryFn: () => fetchOrganizationTeamMembers(teamId),
      enabled: Boolean(teamId),
    }),
  categories: () =>
    queryOptions({
      queryKey: organizationSettingsKeys.categories,
      queryFn: fetchOrganizationCategories,
      staleTime: 30_000,
    }),
  defaultOwners: () =>
    queryOptions({
      queryKey: organizationSettingsKeys.defaultOwners,
      queryFn: fetchOrganizationDefaultOwners,
      staleTime: 30_000,
    }),
  labels: () =>
    queryOptions({
      queryKey: organizationSettingsKeys.labels,
      queryFn: fetchOrganizationLabels,
      staleTime: 30_000,
    }),
};

export const organizationSettingsMutations = {
  createInvitation: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "create-invitation"],
      mutationFn: (request: CreateInvitationRequestDto) => createOrganizationInvitation(request),
    }),
  cancelInvitation: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "cancel-invitation"],
      mutationFn: (invitationId: string) => cancelOrganizationInvitation(invitationId),
    }),
  removeMember: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "remove-member"],
      mutationFn: (userId: string) => removeOrganizationMember(userId),
    }),
  changeMemberRole: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "change-member-role"],
      mutationFn: ({ userId, request }: { userId: string; request: ChangeMemberRoleRequestDto }) =>
        changeOrganizationMemberRole(userId, request),
    }),
  setProfileImage: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "set-profile-image"],
      mutationFn: (request: SetProfileImageRequestDto) => setOrganizationProfileImage(request),
    }),
  deleteProfileImage: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "delete-profile-image"],
      mutationFn: () => deleteOrganizationProfileImage(),
    }),
  createTeam: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "create-team"],
      mutationFn: (request: CreateTeamRequestDto) => createOrganizationTeam(request),
    }),
  deleteTeam: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "delete-team"],
      mutationFn: (teamId: string) => deleteOrganizationTeam(teamId),
    }),
  addTeamMembers: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "add-team-members"],
      mutationFn: ({ teamId, userIds }: { teamId: string; userIds: string[] }) =>
        addOrganizationTeamMembers(teamId, { user_ids: userIds }),
    }),
  removeTeamMembers: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "remove-team-members"],
      mutationFn: ({ teamId, userIds }: { teamId: string; userIds: string[] }) =>
        removeOrganizationTeamMembers(teamId, { user_ids: userIds }),
    }),
  renameCategory: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "rename-category"],
      mutationFn: ({ category, request }: { category: string; request: RenameCategoryRequestDto }) =>
        renameOrganizationCategory(category, request),
    }),
  upsertDefaultOwner: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "upsert-default-owner"],
      mutationFn: (request: PartDefaultOwnerRequestDto) => upsertOrganizationDefaultOwner(request),
    }),
  deleteDefaultOwner: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "delete-default-owner"],
      mutationFn: (category?: string | null) => deleteOrganizationDefaultOwner(category),
    }),
  createLabel: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "create-label"],
      mutationFn: (request: CreateLabelRequestDto) => createOrganizationLabel(request),
    }),
  deleteLabel: () =>
    mutationOptions({
      mutationKey: ["organization-settings", "delete-label"],
      mutationFn: (labelId: string) => deleteOrganizationLabel(labelId),
    }),
};
