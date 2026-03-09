import type { ApiRequestBody, ApiSuccessResponse } from "@/api/types";

type ResponseOf<Path extends keyof import("@/api/generated/schema").paths, Method extends "get" | "post"> =
  Exclude<ApiSuccessResponse<Path, Method>, never>;

export type SendVerificationRequestDto = ApiRequestBody<"/api/v1/auth/send-verification", "post">;
export type SendVerificationResponseDto = ResponseOf<"/api/v1/auth/send-verification", "post">;

export type VerifyEmailRequestDto = ApiRequestBody<"/api/v1/auth/verify-email", "post">;
export type VerifyEmailResponseDto = ResponseOf<"/api/v1/auth/verify-email", "post">;

export type RegisterRequestDto = ApiRequestBody<"/api/v1/auth/register", "post">;
export type RegisterResponseDto = ResponseOf<"/api/v1/auth/register", "post">;

export type LoginRequestDto = ApiRequestBody<"/api/v1/auth/login", "post">;
export type LoginResponseDto = ResponseOf<"/api/v1/auth/login", "post">;
export type WorkspaceLoginResponseDto = Extract<LoginResponseDto, { tokens: unknown }>;
export type ScopedLoginResponseDto = Extract<LoginResponseDto, { scoped_token: string }>;

export type RefreshRequestDto = ApiRequestBody<"/api/v1/auth/refresh", "post">;
export type RefreshResponseDto = ResponseOf<"/api/v1/auth/refresh", "post">;

export type MeResponseDto = ResponseOf<"/api/v1/users/me", "get">;
export type SiteResponseDto = ResponseOf<"/api/v1/auth/site", "get">;
export type CheckEmailResponseDto = ResponseOf<"/api/v1/auth/check-email", "get">;
export type CheckSlugResponseDto = ResponseOf<"/api/v1/auth/check-slug", "get">;
export type VerifyInvitationResponseDto = ResponseOf<"/api/v1/auth/invitations/verify", "get">;
export type AcceptInvitationRequestDto = ApiRequestBody<"/api/v1/auth/accept-invitation", "post">;
export type AcceptInvitationResponseDto = ResponseOf<"/api/v1/auth/accept-invitation", "post">;
export type CreateOrganizationRequestDto = ApiRequestBody<"/api/v1/organizations", "post">;
export type CreateOrganizationResponseDto = ResponseOf<"/api/v1/organizations", "post">;
export type SwitchOrgRequestDto = ApiRequestBody<"/api/v1/organizations/switch", "post">;
