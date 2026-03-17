import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/api/auth.queries";
import { toAuthSessionModel } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { settingsQueries } from "@/features/settings";
import {
  clearAuthCookies,
  clearLogoutCookie,
  clearStoredTokens,
  getAuthCookies,
  getStoredTokens,
  hasLogoutCookie,
  setStoredTokens,
} from "@/lib/auth-cookies";
import { getSubdomain } from "@/lib/subdomain";

export type AuthBootstrapStatus = "loading" | "ready" | "site_not_found";

export function useAuthBootstrapListener() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping);
  const [status, setStatus] = useState<AuthBootstrapStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setBootstrapping(true);

      if (hasLogoutCookie()) {
        clearStoredTokens();
        clearSession();
        clearLogoutCookie();
      }

      const cookieTokens = getAuthCookies();
      if (cookieTokens.accessToken && cookieTokens.refreshToken) {
        setStoredTokens(cookieTokens.accessToken, cookieTokens.refreshToken);
        clearAuthCookies();
      }

      const storedTokens = getStoredTokens();
      if (storedTokens.accessToken && storedTokens.refreshToken) {
        try {
          const meResponse = await queryClient.fetchQuery(authQueries.me());
          try {
            await queryClient.fetchQuery(settingsQueries.detail());
          } catch {
            queryClient.removeQueries({ queryKey: settingsQueries.detail().queryKey });
          }
          if (!cancelled) {
            setSession(toAuthSessionModel(meResponse));
          }
        } catch {
          if (!cancelled) {
            clearStoredTokens();
            clearSession();
          }
        }
      } else {
        clearSession();
      }

      if (getSubdomain()) {
        try {
          await queryClient.fetchQuery(authQueries.site());
        } catch {
          if (!cancelled) {
            setStatus("site_not_found");
            setBootstrapping(false);
          }
          return;
        }
      }

      if (!cancelled) {
        setStatus("ready");
        setBootstrapping(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [clearSession, queryClient, setBootstrapping, setSession]);

  return status;
}
