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
  onboarded_at?: string | null;
}

export interface MembershipResponse {
  org_id: string;
  role: string;
  job_role?: string | null;
  organization: OrganizationResponse;
}

// --- POST /api/v1/auth/register ---

export interface RegisterRequest {
  email: string;
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

// --- GET /api/v1/auth/me ---

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
