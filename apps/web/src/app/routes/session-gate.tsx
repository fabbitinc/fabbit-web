import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { registerUnauthorizedHandler } from "@/api/client";
import { AppLoadingScreen } from "@/app/components/app-loading-screen";
import { SiteNotFoundPage } from "@/app/components/site-not-found-page";
import { useAuthBootstrapListener } from "@/features/auth/hooks/use-auth-bootstrap-listener";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { isRootDomain } from "@/lib/subdomain";

export function SessionGate({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const status = useAuthBootstrapListener();

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      queryClient.clear();
      clearSession();
      window.location.href = isRootDomain() ? "/signup" : "/login";
    });

    return () => {
      registerUnauthorizedHandler(null);
    };
  }, [clearSession, queryClient]);

  if (status === "loading") {
    return <AppLoadingScreen />;
  }

  if (status === "site_not_found") {
    return <SiteNotFoundPage />;
  }

  return children;
}
