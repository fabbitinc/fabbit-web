import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/api/auth.queries";

export function useEmailAvailabilityQuery(email: string, enabled: boolean) {
  return useQuery({
    ...authQueries.checkEmail(email),
    enabled,
  });
}
