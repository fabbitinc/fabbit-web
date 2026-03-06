import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  organizationSettingsKeys,
  organizationSettingsMutations,
} from "@/features/organization-settings/api/organization-settings.queries";
import { extractApiError } from "@/lib/api-error";

export function useCreateOrganizationLabelAction() {
  const queryClient = useQueryClient();

  return useMutation({
    ...organizationSettingsMutations.createLabel(),
    mutationKey: ["organization-settings", "create-organization-label-action"],
    onSuccess: () => {
      toast.success("라벨을 추가했습니다.");
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.labels });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "라벨 추가에 실패했습니다."));
    },
  });
}
