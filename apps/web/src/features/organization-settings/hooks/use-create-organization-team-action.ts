import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  organizationSettingsKeys,
  organizationSettingsMutations,
} from "@/features/organization-settings/api/organization-settings.queries";
import { extractApiError } from "@/lib/api-error";

export function useCreateOrganizationTeamAction() {
  const queryClient = useQueryClient();

  return useMutation({
    ...organizationSettingsMutations.createTeam(),
    mutationKey: ["organization-settings", "create-organization-team-action"],
    onSuccess: () => {
      toast.success("팀을 생성했습니다.");
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.teams });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "팀 생성에 실패했습니다."));
    },
  });
}
