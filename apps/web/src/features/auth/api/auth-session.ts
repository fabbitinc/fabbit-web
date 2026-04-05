import type { QueryClient } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/api/auth.queries";
import { toAuthSessionModel } from "@/features/auth/api/auth.api";
import type { AuthSessionModel } from "@/features/auth/types/auth-model";

export async function refreshAuthSession(queryClient: QueryClient): Promise<AuthSessionModel> {
  const response = await queryClient.fetchQuery({
    ...authQueries.me(),
    staleTime: 0,
  });
  return toAuthSessionModel(response);
}
