import { useQuery } from "@tanstack/react-query";
import { organizationSettingsQueries } from "@/features/organization-settings/api/organization-settings.queries";

export function useOrganizationDefaultOwnersQuery() {
  return useQuery(organizationSettingsQueries.defaultOwners());
}
