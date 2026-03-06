import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  organizationSettingsKeys,
  organizationSettingsMutations,
} from "@/features/organization-settings/api/organization-settings.queries";
import { extractApiError } from "@/lib/api-error";

export function useRemoveOrganizationMemberAction() {
  const queryClient = useQueryClient();

  return useMutation({
    ...organizationSettingsMutations.removeMember(),
    mutationKey: ["organization-settings", "remove-organization-member-action"],
    onSuccess: () => {
      toast.success("사용자를 제거했습니다.");
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.members });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "사용자 제거에 실패했습니다."));
    },
  });
}
