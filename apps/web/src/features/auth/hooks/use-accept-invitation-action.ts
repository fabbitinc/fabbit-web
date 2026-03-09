import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/api/auth.queries";
import { acceptInvitation, toAuthSessionModel } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { setAuthCookies, setStoredTokens } from "@/lib/auth-cookies";

const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;

interface AcceptInvitationActionInput {
  token: string;
  fullName?: string;
  password?: string;
}

interface AcceptInvitationActionResult {
  redirectUrl: string;
}

function buildSubdomainUrl(slug: string, path: string) {
  return `${window.location.protocol}//${slug}.${APP_DOMAIN}${path}`;
}

export function useAcceptInvitationAction() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationKey: ["auth", "accept-invitation-action"],
    mutationFn: async ({
      token,
      fullName,
      password,
    }: AcceptInvitationActionInput): Promise<AcceptInvitationActionResult> => {
      const response = await acceptInvitation({
        token,
        ...(fullName ? { full_name: fullName } : {}),
        ...(password ? { password } : {}),
      });

      const targetHost = `${response.organization.slug}.${APP_DOMAIN}`;
      const isSameWorkspace = window.location.host === targetHost;

      if (isSameWorkspace) {
        setStoredTokens(response.tokens.access_token, response.tokens.refresh_token);
        const meResponse = await queryClient.fetchQuery(authQueries.me());
        setSession(toAuthSessionModel(meResponse));

        return { redirectUrl: "/" };
      }

      setAuthCookies(response.tokens.access_token, response.tokens.refresh_token);

      return {
        redirectUrl: buildSubdomainUrl(response.organization.slug, "/"),
      };
    },
  });
}
