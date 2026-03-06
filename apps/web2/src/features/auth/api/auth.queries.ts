import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  acceptInvitation,
  checkEmail,
  checkSlug,
  createOrganization,
  fetchCurrentUser,
  fetchWorkspaceSite,
  loginScoped,
  loginWorkspace,
  logoutSession,
  registerUser,
  sendVerification,
  switchOrganization,
  verifyEmail,
  verifyInvitation,
} from "@/features/auth/api/auth.api";
import type {
  AcceptInvitationRequestDto,
  CreateOrganizationRequestDto,
  LoginRequestDto,
  RegisterRequestDto,
  SendVerificationRequestDto,
  SwitchOrgRequestDto,
  VerifyEmailRequestDto,
} from "@/features/auth/api/auth.types";

export const authQueries = {
  me: () =>
    queryOptions({
      queryKey: ["auth", "me"],
      queryFn: fetchCurrentUser,
      staleTime: 30_000,
    }),
  site: () =>
    queryOptions({
      queryKey: ["auth", "site"],
      queryFn: fetchWorkspaceSite,
      staleTime: 60_000,
    }),
  checkEmail: (email: string) =>
    queryOptions({
      queryKey: ["auth", "check-email", email],
      queryFn: () => checkEmail(email),
      staleTime: 10_000,
    }),
  checkSlug: (slug: string) =>
    queryOptions({
      queryKey: ["auth", "check-slug", slug],
      queryFn: () => checkSlug(slug),
      staleTime: 10_000,
    }),
  invitation: (token: string) =>
    queryOptions({
      queryKey: ["auth", "invitation", token],
      queryFn: () => verifyInvitation(token),
      staleTime: 60_000,
    }),
};

export const authMutations = {
  login: () =>
    mutationOptions({
      mutationKey: ["auth", "login"],
      mutationFn: (request: LoginRequestDto) => loginWorkspace(request),
    }),
  scopedLogin: () =>
    mutationOptions({
      mutationKey: ["auth", "scoped-login"],
      mutationFn: (request: LoginRequestDto) => loginScoped(request),
    }),
  register: () =>
    mutationOptions({
      mutationKey: ["auth", "register"],
      mutationFn: (request: RegisterRequestDto) => registerUser(request),
    }),
  sendVerification: () =>
    mutationOptions({
      mutationKey: ["auth", "send-verification"],
      mutationFn: (request: SendVerificationRequestDto) => sendVerification(request),
    }),
  verifyEmail: () =>
    mutationOptions({
      mutationKey: ["auth", "verify-email"],
      mutationFn: (request: VerifyEmailRequestDto) => verifyEmail(request),
    }),
  acceptInvitation: () =>
    mutationOptions({
      mutationKey: ["auth", "accept-invitation"],
      mutationFn: (request: AcceptInvitationRequestDto) => acceptInvitation(request),
    }),
  createOrganization: (scopedToken: string) =>
    mutationOptions({
      mutationKey: ["auth", "create-organization"],
      mutationFn: (request: CreateOrganizationRequestDto) => createOrganization(request, scopedToken),
    }),
  switchOrganization: () =>
    mutationOptions({
      mutationKey: ["auth", "switch-organization"],
      mutationFn: (request: SwitchOrgRequestDto) => switchOrganization(request),
    }),
  logout: () =>
    mutationOptions({
      mutationKey: ["auth", "logout"],
      mutationFn: (refreshToken: string) => logoutSession(refreshToken),
    }),
};
