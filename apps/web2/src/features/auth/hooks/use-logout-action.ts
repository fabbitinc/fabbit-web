import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutSession } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import {
  clearAuthCookies,
  clearStoredTokens,
  getStoredTokens,
  setLogoutCookie,
} from "@/lib/auth-cookies";
import { isRootDomain } from "@/lib/subdomain";

interface LogoutActionResult {
  destination: string;
}

export function useLogoutAction() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationKey: ["auth", "logout", "action"],
    mutationFn: async (): Promise<LogoutActionResult> => {
      const refreshToken = getStoredTokens().refreshToken;

      if (refreshToken) {
        try {
          await logoutSession(refreshToken);
        } catch {
          // 서버 로그아웃 실패와 무관하게 로컬 세션은 정리한다.
        }
      }

      clearStoredTokens();
      clearAuthCookies();
      setLogoutCookie();
      clearSession();

      return {
        destination: isRootDomain() ? "/signup" : "/login",
      };
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
