import axios from "axios";
import { apiClient } from "@/api/client";
import { getSubdomain } from "@/lib/subdomain";
import type {
  AcceptInvitationRequestDto,
  AcceptInvitationResponseDto,
  CheckEmailResponseDto,
  CheckSlugResponseDto,
  CreateOrganizationRequestDto,
  CreateOrganizationResponseDto,
  LoginRequestDto,
  MeResponseDto,
  RefreshRequestDto,
  RefreshResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  ScopedLoginResponseDto,
  SendVerificationRequestDto,
  SendVerificationResponseDto,
  SiteResponseDto,
  WorkspaceLoginResponseDto,
  SwitchOrgRequestDto,
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
  VerifyInvitationResponseDto,
} from "@/features/auth/api/auth.types";
import type {
  AuthSessionModel,
  MembershipModel,
  OrganizationModel,
  UserModel,
  WorkspaceSiteModel,
} from "@/features/auth/types/auth-model";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function sendVerification(
  request: SendVerificationRequestDto,
) {
  const response = await apiClient.post<SendVerificationResponseDto>("/api/v1/auth/send-verification", request);
  return response.data;
}

export async function verifyEmail(request: VerifyEmailRequestDto) {
  const response = await apiClient.post<VerifyEmailResponseDto>("/api/v1/auth/verify-email", request);
  return response.data;
}

export async function registerUser(request: RegisterRequestDto) {
  const response = await apiClient.post<RegisterResponseDto>("/api/v1/auth/register", request);
  return response.data;
}

export async function loginWorkspace(request: LoginRequestDto) {
  const response = await apiClient.post<WorkspaceLoginResponseDto>("/api/v1/auth/login", request);
  return response.data;
}

export async function loginScoped(request: LoginRequestDto) {
  const response = await axios.post<ScopedLoginResponseDto>(
    `${API_BASE_URL}/api/v1/auth/login`,
    request,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}

export async function refreshSession(request: RefreshRequestDto) {
  const response = await apiClient.post<RefreshResponseDto>("/api/v1/auth/refresh", request);
  return response.data;
}

export async function logoutSession(refreshToken: string) {
  await apiClient.post("/api/v1/auth/logout", { refresh_token: refreshToken });
}

export async function fetchCurrentUser() {
  const response = await apiClient.get<MeResponseDto>("/api/v1/users/me");
  return response.data;
}

export async function fetchWorkspaceSite() {
  const response = await apiClient.get<SiteResponseDto>("/api/v1/auth/site");
  return toWorkspaceSiteModel(response.data);
}

export async function checkEmail(email: string) {
  const response = await apiClient.get<CheckEmailResponseDto>("/api/v1/auth/check-email", {
    params: { email },
  });
  return response.data;
}

export async function checkSlug(slug: string) {
  const response = await apiClient.get<CheckSlugResponseDto>("/api/v1/auth/check-slug", {
    params: { slug },
  });
  return response.data;
}

export async function verifyInvitation(token: string) {
  const response = await apiClient.get<VerifyInvitationResponseDto>("/api/v1/auth/invitations/verify", {
    params: { token },
  });
  return response.data;
}

export async function acceptInvitation(request: AcceptInvitationRequestDto) {
  const response = await apiClient.post<AcceptInvitationResponseDto>("/api/v1/auth/accept-invitation", request);
  return response.data;
}

export async function createOrganization(
  request: CreateOrganizationRequestDto,
  scopedToken: string,
) {
  const response = await axios.post<CreateOrganizationResponseDto>(
    `${API_BASE_URL}/api/v1/organizations`,
    request,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${scopedToken}`,
      },
    },
  );

  return response.data;
}

export async function switchOrganization(request: SwitchOrgRequestDto) {
  const response = await apiClient.post<WorkspaceLoginResponseDto>("/api/v1/organizations/switch", request);
  return response.data;
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
