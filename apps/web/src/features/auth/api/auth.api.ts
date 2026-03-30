import {
  authAcceptInvitation as acceptInvitationApiV1AuthAcceptInvitationPost,
  authCheckEmail as checkEmailApiV1AuthCheckEmailGet,
  authCheckSlug as checkSlugApiV1AuthCheckSlugGet,
  authGetSite as getSiteApiV1AuthSiteGet,
  authLogin as loginApiV1AuthLoginPost,
  authLogout as logoutApiV1AuthLogoutPost,
  authRefresh as refreshApiV1AuthRefreshPost,
  authRegister as registerApiV1AuthRegisterPost,
  authSendVerification as sendVerificationApiV1AuthSendVerificationPost,
  authVerifyEmail as verifyEmailApiV1AuthVerifyEmailPost,
  authVerifyInvitation as verifyInvitationApiV1AuthInvitationsVerifyGet,
} from "@/api/generated/orval/auth/auth";
import {
  organizationCreate as createOrganizationApiV1OrganizationsPost,
  organizationSwitch as switchOrgApiV1OrganizationsSwitchPost,
} from "@/api/generated/orval/organizations/organizations";
import { userGetMe as meApiV1UsersMeGet } from "@/api/generated/orval/users/users";
import { getSubdomain } from "@/lib/subdomain";
import type {
  AcceptInvitationRequestDto,
  CreateOrganizationRequestDto,
  CreateOrganizationResponseDto,
  LoginRequestDto,
  MeResponseDto,
  RefreshRequestDto,
  RegisterRequestDto,
  RegisterResponseDto,
  ScopedLoginResponseDto,
  SendVerificationRequestDto,
  SiteResponseDto,
  WorkspaceLoginResponseDto,
  SwitchOrgRequestDto,
  VerifyEmailRequestDto,
} from "@/features/auth/api/auth.types";
import type {
  AuthSessionModel,
  MembershipModel,
  OrganizationModel,
  UserModel,
  WorkspaceSiteModel,
} from "@/features/auth/types/auth-model";

export async function sendVerification(
  request: SendVerificationRequestDto,
) {
  return sendVerificationApiV1AuthSendVerificationPost(request);
}

export async function verifyEmail(request: VerifyEmailRequestDto) {
  return verifyEmailApiV1AuthVerifyEmailPost(request);
}

export async function registerUser(request: RegisterRequestDto) {
  return registerApiV1AuthRegisterPost(request);
}

export async function loginWorkspace(request: LoginRequestDto) {
  return loginApiV1AuthLoginPost(request) as Promise<WorkspaceLoginResponseDto>;
}

export async function loginScoped(request: LoginRequestDto) {
  return loginApiV1AuthLoginPost(request) as Promise<ScopedLoginResponseDto>;
}

export async function refreshSession(request: RefreshRequestDto) {
  return refreshApiV1AuthRefreshPost(request);
}

export async function logoutSession(refreshToken: string) {
  await logoutApiV1AuthLogoutPost({ refresh_token: refreshToken });
}

export async function fetchCurrentUser() {
  return meApiV1UsersMeGet();
}

export async function fetchWorkspaceSite() {
  const response = await getSiteApiV1AuthSiteGet();
  return toWorkspaceSiteModel(response);
}

export async function checkEmail(email: string) {
  return checkEmailApiV1AuthCheckEmailGet({ email });
}

export async function checkSlug(slug: string) {
  return checkSlugApiV1AuthCheckSlugGet({ slug });
}

export async function verifyInvitation(token: string) {
  return verifyInvitationApiV1AuthInvitationsVerifyGet({ token });
}

export async function acceptInvitation(request: AcceptInvitationRequestDto) {
  return acceptInvitationApiV1AuthAcceptInvitationPost(request);
}

export async function createOrganization(
  request: CreateOrganizationRequestDto,
  scopedToken: string,
) {
  return createOrganizationApiV1OrganizationsPost(
    request,
    {
      headers: {
        Authorization: `Bearer ${scopedToken}`,
      },
    },
  );
}

export async function switchOrganization(request: SwitchOrgRequestDto) {
  return switchOrgApiV1OrganizationsSwitchPost(request) as Promise<WorkspaceLoginResponseDto>;
}

function toUserModel(user: MeResponseDto["user"] | WorkspaceLoginResponseDto["user"] | RegisterResponseDto["user"]): UserModel {
  return {
    id: user.id,
    email: user.email,
    name: user.full_name,
    phone: user.phone ?? null,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toOrganizationModel(
  organization: MeResponseDto["memberships"][number]["organization"] | RegisterResponseDto["organization"] | CreateOrganizationResponseDto["organization"],
): OrganizationModel {
  return {
    id: organization.id,
    slug: organization.slug,
    name: organization.name,
    industry: "industry" in organization ? (organization.industry ?? null) : null,
    teamSize: "team_size" in organization ? (organization.team_size ?? null) : null,
    planType: organization.plan_type,
    profileImageUrl: organization.profile_image_url ?? null,
  };
}

function toMembershipModel(membership: MeResponseDto["memberships"][number]): MembershipModel {
  return {
    orgId: membership.org_id,
    role: membership.role,
    jobRole: membership.job_role ?? null,
    organization: toOrganizationModel(membership.organization),
  };
}

function findCurrentMembership(memberships: MembershipModel[]) {
  const currentSubdomain = getSubdomain();

  if (currentSubdomain) {
    return memberships.find((membership) => membership.organization.slug === currentSubdomain) ?? null;
  }

  return memberships[0] ?? null;
}

export function toAuthSessionModel(response: MeResponseDto): AuthSessionModel {
  const memberships = response.memberships.map(toMembershipModel);

  return {
    user: toUserModel(response.user),
    memberships,
    currentMembership: findCurrentMembership(memberships),
  };
}

export function toWorkspaceSiteModel(response: SiteResponseDto): WorkspaceSiteModel {
  return {
    slug: response.slug,
    name: response.name,
  };
}
