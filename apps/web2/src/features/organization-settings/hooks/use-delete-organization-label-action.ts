import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  organizationSettingsKeys,
  organizationSettingsMutations,
} from "@/features/organization-settings/api/organization-settings.queries";
import { extractApiError } from "@/lib/api-error";

export function useDeleteOrganizationLabelAction() {
  const queryClient = useQueryClient();

  return useMutation({
    ...organizationSettingsMutations.deleteLabel(),
    mutationKey: ["organization-settings", "delete-organization-label-action"],
    onSuccess: () => {
      toast.success("라벨을 삭제했습니다.");
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.labels });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "라벨 삭제에 실패했습니다."));
    },
  });
}
