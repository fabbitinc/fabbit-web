export interface UserModel {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  profileImageUrl?: string | null;
}

export interface OrganizationModel {
  id: string;
  slug: string;
  name: string;
  industry?: string | null;
  teamSize?: string | null;
  planType: string;
  profileImageUrl?: string | null;
}

export interface MembershipModel {
  orgId: string;
  role: string;
  jobRole?: string | null;
  organization: OrganizationModel;
}

export interface AuthSessionModel {
  user: UserModel;
  memberships: MembershipModel[];
  currentMembership: MembershipModel | null;
}

export interface WorkspaceSiteModel {
  slug: string;
  name: string;
}
