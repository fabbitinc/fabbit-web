export type OrganizationSettingsTab =
  | "general"
  | "members"
  | "parts"
  | "change"
  | "billing"
  | "usage"
  | "security"
  | "logs"
  | "advanced";

export type OrganizationMembersSubTab = "users" | "teams";
export type OrganizationPartsSubTab = "categories" | "assignment";
export type OrganizationChangeSubTab = "labels";
export type MemberRoleModel = "MEMBER" | "ADMIN" | "OWNER";

export interface OrganizationUserSummaryModel {
  userId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  profileImageUrl?: string | null;
}

export interface OrganizationMemberModel extends OrganizationUserSummaryModel {
  role: MemberRoleModel;
  jobRole?: string | null;
}

export interface OrganizationInvitationModel {
  id: string;
  orgId: string;
  email: string;
  role: MemberRoleModel;
  status: string;
  invitedBy: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
}

export interface OrganizationTeamModel {
  id: string;
  name: string;
  description?: string | null;
  memberCount: number;
  createdBy: string;
  createdAt: string;
}

export interface OrganizationCategoryModel {
  category: string;
  partCount: number;
}

export interface OrganizationDefaultOwnerModel {
  id: string;
  category?: string | null;
  defaultOwnerId?: string | null;
  defaultOwner?: OrganizationUserSummaryModel | null;
  defaultOwnerTeamId?: string | null;
  defaultOwnerTeamName?: string | null;
}

export interface OrganizationLabelModel {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  createdAt: string;
  createdBy?: string | null;
}

export interface AllowedIpEntry {
  id: string;
  cidr: string;
}

export interface OrganizationActivityLogModel {
  id: string;
  action: string;
  actor: string;
  target: string;
  ip: string;
  at: string;
  result: "성공" | "실패";
}
