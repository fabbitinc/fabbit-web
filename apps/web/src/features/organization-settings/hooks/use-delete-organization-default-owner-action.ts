import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  organizationSettingsKeys,
  organizationSettingsMutations,
} from "@/features/organization-settings/api/organization-settings.queries";
import { extractApiError } from "@/lib/api-error";

export function useDeleteOrganizationDefaultOwnerAction() {
  const queryClient = useQueryClient();

  return useMutation({
    ...organizationSettingsMutations.deleteDefaultOwner(),
    mutationKey: ["organization-settings", "delete-organization-default-owner-action"],
    onSuccess: () => {
      toast.success("기본 담당 설정을 삭제했습니다.");
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.defaultOwners });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "기본 담당 설정 삭제에 실패했습니다."));
    },
  });
}
