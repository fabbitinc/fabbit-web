// Auth API 타입 정의

// --- 공통 응답 타입 ---

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface OrganizationResponse {
  id: string;
  slug: string;
  name: string;
  industry?: string | null;
  team_size?: string | null;
  plan_type: string;
}

export interface MembershipResponse {
  org_id: string;
  role: string;
  job_role?: string | null;
  organization: OrganizationResponse;
}

// --- POST /api/v1/auth/send-verification ---

export interface SendVerificationRequest {
  email: string;
  turnstile_token?: string | null;
}

export interface SendVerificationResponse {
  message: string;
}

// --- POST /api/v1/auth/verify-email ---

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  verification_token: string;
  email: string;
}

// --- POST /api/v1/auth/register ---

export interface RegisterRequest {
  verification_token: string;
  code: string;
  password: string;
  full_name: string;
  org_name: string;
  slug?: string | null;
  industry?: string | null;
  team_size?: string | null;
  job_role?: string | null;
  plan_type?: string;
  turnstile_token?: string | null;
}

export interface RegisterResponse {
  user: UserResponse;
  organization: OrganizationResponse;
  tokens: TokenResponse;
}

// --- POST /api/v1/auth/login ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  tokens: TokenResponse;
}

// --- POST /api/v1/auth/login (register 도메인, slug 없이) ---

export interface ScopedLoginResponse {
  user: UserResponse;
  scoped_token: string;
}

// --- POST /api/v1/organizations (scoped_token 인증) ---

export interface CreateOrganizationRequest {
  org_name: string;
  slug?: string | null;
  industry?: string | null;
  team_size?: string | null;
  plan_type?: string;
}

export interface CreateOrganizationResponse {
  organization: OrganizationResponse;
  tokens: TokenResponse;
}

// --- POST /api/v1/organizations/switch ---

export interface SwitchOrgRequest {
  slug: string;
}

// --- GET /api/v1/users/me ---

export interface MeResponse {
  user: UserResponse;
  memberships: MembershipResponse[];
}

// --- POST /api/v1/auth/refresh ---

export interface RefreshRequest {
  refresh_token: string;
}

// --- GET /api/v1/auth/site ---

export interface SiteResponse {
  slug: string;
  name: string;
}

// --- GET /api/v1/auth/check-email ---

export interface CheckEmailResponse {
  available: boolean;
  message: string | null;
}

// --- GET /api/v1/auth/check-slug ---

export interface CheckSlugResponse {
  available: boolean;
  message: string | null;
  suggestion: string | null;
}

// --- GET /api/v1/auth/invitations/verify ---

export interface VerifyInvitationResponse {
  email: string;
  org_name: string;
  inviter_name: string;
  role: string;
  is_existing_user: boolean;
  expires_at: string;
}

// --- POST /api/v1/auth/accept-invitation ---

export interface AcceptInvitationRequest {
  token: string;
  password?: string;
  full_name?: string;
}

export interface AcceptInvitationResponse {
  user: UserResponse;
  organization: OrganizationResponse;
  tokens: TokenResponse;
  is_new_user: boolean;
}
