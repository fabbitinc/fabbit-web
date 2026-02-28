import axios from "axios";
import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshRequest,
  TokenResponse,
  MeResponse,
  SiteResponse,
  CheckEmailResponse,
  CheckSlugResponse,
  VerifyInvitationResponse,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  ScopedLoginResponse,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  SwitchOrgRequest,
  SendVerificationRequest,
  SendVerificationResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "./types";

/**
 * 이메일 인증코드 발송
 * POST /api/v1/auth/send-verification
 */
export async function sendVerification(request: SendVerificationRequest): Promise<SendVerificationResponse> {
  const response = await apiClient.post<SendVerificationResponse>("/api/v1/auth/send-verification", request);
  return response.data;
}

/**
 * 이메일 인증코드 확인
 * POST /api/v1/auth/verify-email
 */
export async function verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  const response = await apiClient.post<VerifyEmailResponse>("/api/v1/auth/verify-email", request);
  return response.data;
}

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
 * GET /api/v1/users/me
 */
export async function getMe(): Promise<MeResponse> {
  const response = await apiClient.get<MeResponse>("/api/v1/users/me");
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

/**
 * 초대 토큰 검증
 * GET /api/v1/auth/invitations/verify?token=...
 */
export async function verifyInvitation(token: string): Promise<VerifyInvitationResponse> {
  const response = await apiClient.get<VerifyInvitationResponse>("/api/v1/auth/invitations/verify", {
    params: { token },
  });
  return response.data;
}

/**
 * 초대 수락
 * POST /api/v1/auth/accept-invitation
 */
export async function acceptInvitation(request: AcceptInvitationRequest): Promise<AcceptInvitationResponse> {
  const response = await apiClient.post<AcceptInvitationResponse>("/api/v1/auth/accept-invitation", request);
  return response.data;
}

/**
 * 조직 전환
 * POST /api/v1/organizations/switch
 */
export async function switchOrg(request: SwitchOrgRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/v1/organizations/switch", request);
  return response.data;
}

/**
 * register 도메인 전용 로그인 (scoped_token 반환)
 * POST /api/v1/auth/login (slug 없이 호출 시)
 */
export async function loginScoped(request: LoginRequest): Promise<ScopedLoginResponse> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await axios.post<ScopedLoginResponse>(`${API_BASE_URL}/api/v1/auth/login`, request, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

/**
 * 조직 생성 (scopedToken 인증)
 * POST /api/v1/organizations
 */
export async function createOrganization(
  request: CreateOrganizationRequest,
  scopedToken: string,
): Promise<CreateOrganizationResponse> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const response = await axios.post<CreateOrganizationResponse>(
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
