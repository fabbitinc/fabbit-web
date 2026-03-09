import { useQuery } from "@tanstack/react-query";
import { organizationSettingsQueries } from "@/features/organization-settings/api/organization-settings.queries";

export function useOrganizationInvitationsQuery() {
  return useQuery(organizationSettingsQueries.invitations());
}
