// Auth API 타입 정의

// POST /api/v1/auth/user/login
// POST /api/v1/auth/admin/login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  // TODO: API 스펙에 user 정보 포함 여부 불명확
  // 필요시 /api/v1/users/me 같은 엔드포인트 필요
}

// POST /api/v1/auth/refresh
export interface RefreshTokenRequest {
  refreshToken: string;
}

// POST /api/v1/auth/logout
export interface LogoutRequest {
  refreshToken: string;
}

// POST /api/v1/admin/organizations
export type OrganizationPlanTier = "FREE_TIER" | "STARTER" | "PROFESSIONAL" | "ELITE";

export interface CreateOrganizationRequest {
  organizationName: string;
  subdomain: string;
  planTier?: OrganizationPlanTier;
  ownerEmail: string;
  ownerPassword: string;
  ownerName: string;
}

export interface CreateOrganizationResponse {
  organizationId: string;
  subdomain: string;
  ownerAccountId: string;
  ownerEmail: string;
}
