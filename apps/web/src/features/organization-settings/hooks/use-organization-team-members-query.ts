import { useQuery } from "@tanstack/react-query";
import { organizationSettingsQueries } from "@/features/organization-settings/api/organization-settings.queries";

export function useOrganizationTeamMembersQuery(teamId: string | null) {
  return useQuery({
    ...organizationSettingsQueries.teamMembers(teamId ?? ""),
    enabled: Boolean(teamId),
  });
}
