import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  organizationSettingsKeys,
  organizationSettingsMutations,
} from "@/features/organization-settings/api/organization-settings.queries";
import { extractApiError } from "@/lib/api-error";

export function useChangeOrganizationMemberRoleAction() {
  const queryClient = useQueryClient();

  return useMutation({
    ...organizationSettingsMutations.changeMemberRole(),
    mutationKey: ["organization-settings", "change-organization-member-role-action"],
    onSuccess: () => {
      toast.success("역할을 변경했습니다.");
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.members });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "역할 변경에 실패했습니다."));
    },
  });
}
