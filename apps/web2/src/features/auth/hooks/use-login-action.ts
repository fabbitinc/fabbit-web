import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/api/auth.queries";
import { loginScoped, loginWorkspace, toAuthSessionModel } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useRegistrationStore } from "@/features/registration/stores/registration-store";
import { setStoredTokens } from "@/lib/auth-cookies";
import { isRootDomain } from "@/lib/subdomain";

interface LoginActionInput {
  email: string;
  password: string;
}

interface LoginActionResult {
  destination: "/" | "/workspace";
}

export function useLoginAction() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);
  const setScopedToken = useRegistrationStore((state) => state.setScopedToken);

  return useMutation({
    mutationKey: ["auth", "login-action"],
    mutationFn: async ({ email, password }: LoginActionInput): Promise<LoginActionResult> => {
      if (isRootDomain()) {
        const response = await loginScoped({ email, password });
        setScopedToken(response.scoped_token);

        return { destination: "/workspace" };
      }

      const response = await loginWorkspace({ email, password });
      setStoredTokens(response.tokens.access_token, response.tokens.refresh_token);

      const meResponse = await queryClient.fetchQuery(authQueries.me());
      setSession(toAuthSessionModel(meResponse));

      return { destination: "/" };
    },
  });
}
