import { useMutation } from "@tanstack/react-query";
import { switchOrganization } from "@/features/auth/api/auth.api";
import { setAuthCookies, setStoredTokens } from "@/lib/auth-cookies";

interface SwitchOrganizationActionResult {
  redirectUrl: string;
}

function getAppDomain() {
  const configuredDomain = import.meta.env.VITE_APP_DOMAIN;

  if (configuredDomain) {
    return configuredDomain;
  }

  const host = window.location.host;
  const hostParts = host.split(".");

  if (hostParts.length <= 1) {
    return host;
  }

  return hostParts.slice(-2).join(".");
}

export function useSwitchOrganizationAction() {
  return useMutation({
    mutationKey: ["auth", "switch-organization", "action"],
    mutationFn: async (slug: string): Promise<SwitchOrganizationActionResult> => {
      const response = await switchOrganization({ slug });
      setStoredTokens(response.tokens.access_token, response.tokens.refresh_token);
      setAuthCookies(response.tokens.access_token, response.tokens.refresh_token);

      return {
        redirectUrl: `${window.location.protocol}//${slug}.${getAppDomain()}/`,
      };
    },
  });
}
