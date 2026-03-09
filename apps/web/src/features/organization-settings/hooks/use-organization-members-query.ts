import { useQuery } from "@tanstack/react-query";
import { organizationSettingsQueries } from "@/features/organization-settings/api/organization-settings.queries";

export function useOrganizationMembersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    ...organizationSettingsQueries.members(),
    enabled: options?.enabled,
  });
}
