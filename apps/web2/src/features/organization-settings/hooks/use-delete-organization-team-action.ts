import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  organizationSettingsKeys,
  organizationSettingsMutations,
} from "@/features/organization-settings/api/organization-settings.queries";
import { extractApiError } from "@/lib/api-error";

export function useDeleteOrganizationTeamAction() {
  const queryClient = useQueryClient();

  return useMutation({
    ...organizationSettingsMutations.deleteTeam(),
    mutationKey: ["organization-settings", "delete-organization-team-action"],
    onSuccess: () => {
      toast.success("팀을 삭제했습니다.");
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.teams });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "팀 삭제에 실패했습니다."));
    },
  });
}
