import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/api/auth.queries";

export function useInvitationQuery(token: string, enabled: boolean) {
  return useQuery({
    ...authQueries.invitation(token),
    enabled,
  });
}
