import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshRequest,
  TokenResponse,
  MeResponse,
  OrganizationResponse,
  SiteResponse,
  CheckEmailResponse,
  CheckSlugResponse,
} from "./types";

/**
 * 회원가입
 * POST /api/v1/auth/register
 */
export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>("/api/v1/auth/register", request);
  return response.data;
}

/**
 * 로그인
 * POST /api/v1/auth/login
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/v1/auth/login", request);
  return response.data;
}

/**
 * 토큰 갱신
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(request: RefreshRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/api/v1/auth/refresh", request);
  return response.data;
}

/**
 * 로그아웃
 * POST /api/v1/auth/logout
 */
export async function logout(refreshTokenValue: string): Promise<void> {
  await apiClient.post("/api/v1/auth/logout", { refresh_token: refreshTokenValue });
}

/**
 * 내 정보 조회
 * GET /api/v1/auth/me
 */
export async function getMe(): Promise<MeResponse> {
  const response = await apiClient.get<MeResponse>("/api/v1/auth/me");
  return response.data;
}

/**
 * 온보딩 완료
 * POST /api/v1/auth/onboarding/complete
 */
export async function completeOnboarding(): Promise<OrganizationResponse> {
  const response = await apiClient.post<OrganizationResponse>("/api/v1/auth/onboarding/complete");
  return response.data;
}

/**
 * 사이트(워크스페이스) 정보 조회
 * GET /api/v1/auth/site
 */
export async function getSite(): Promise<SiteResponse> {
  const response = await apiClient.get<SiteResponse>("/api/v1/auth/site");
  return response.data;
}

/**
 * 이메일 중복 체크
 * GET /api/v1/auth/check-email?email=...
 */
export async function checkEmail(email: string): Promise<CheckEmailResponse> {
  const response = await apiClient.get<CheckEmailResponse>("/api/v1/auth/check-email", {
    params: { email },
  });
  return response.data;
}

/**
 * 워크스페이스 slug 중복 체크
 * GET /api/v1/auth/check-slug?slug=...
 */
export async function checkSlug(slug: string): Promise<CheckSlugResponse> {
  const response = await apiClient.get<CheckSlugResponse>("/api/v1/auth/check-slug", {
    params: { slug },
  });
  return response.data;
}
