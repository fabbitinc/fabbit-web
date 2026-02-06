import { apiClient } from "./client";
import type { LoginRequest, AuthResponse, RefreshTokenRequest, LogoutRequest } from "./types";

/**
 * User 로그인
 * POST /api/v1/auth/user/login
 */
export async function loginUser(request: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/v1/auth/user/login", request);
  return response.data;
}

/**
 * Admin 로그인
 * POST /api/v1/auth/admin/login
 */
export async function loginAdmin(request: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/v1/auth/admin/login", request);
  return response.data;
}

/**
 * 토큰 갱신
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/v1/auth/refresh", request);
  return response.data;
}

/**
 * 로그아웃
 * POST /api/v1/auth/logout
 */
export async function logout(request: LogoutRequest): Promise<void> {
  await apiClient.post("/api/v1/auth/logout", request);
}
