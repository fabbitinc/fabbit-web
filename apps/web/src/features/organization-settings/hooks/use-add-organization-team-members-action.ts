import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  organizationSettingsKeys,
} from "@/features/organization-settings/api/organization-settings.queries";
import { addOrganizationTeamMembers } from "@/features/organization-settings/api/organization-settings.api";
import { extractApiError } from "@/lib/api-error";

export function useAddOrganizationTeamMembersAction(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["organization-settings", "add-organization-team-members-action", teamId],
    mutationFn: (userIds: string[]) => addOrganizationTeamMembers(teamId, { user_ids: userIds }),
    onSuccess: () => {
      toast.success("팀 멤버를 추가했습니다.");
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.teamMembers(teamId) });
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.teams });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "팀 멤버 추가에 실패했습니다."));
    },
  });
}
