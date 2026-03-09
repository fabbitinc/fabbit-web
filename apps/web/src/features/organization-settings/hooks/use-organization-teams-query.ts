import { useQuery } from "@tanstack/react-query";
import { organizationSettingsQueries } from "@/features/organization-settings/api/organization-settings.queries";

export function useOrganizationTeamsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...organizationSettingsQueries.teams(),
    enabled: options?.enabled,
  });
}
