import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/api/auth.queries";

export function useSlugAvailabilityQuery(slug: string, enabled: boolean) {
  return useQuery({
    ...authQueries.checkSlug(slug),
    enabled,
  });
}
