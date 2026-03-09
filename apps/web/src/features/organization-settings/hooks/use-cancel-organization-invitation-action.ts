import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  organizationSettingsKeys,
  organizationSettingsMutations,
} from "@/features/organization-settings/api/organization-settings.queries";
import { extractApiError } from "@/lib/api-error";

export function useCancelOrganizationInvitationAction() {
  const queryClient = useQueryClient();

  return useMutation({
    ...organizationSettingsMutations.cancelInvitation(),
    mutationKey: ["organization-settings", "cancel-organization-invitation-action"],
    onSuccess: () => {
      toast.success("초대를 취소했습니다.");
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.invitations });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "초대 취소에 실패했습니다."));
    },
  });
}
