import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  settingsKeys,
  settingsMutations,
} from "@/features/settings/api/settings.queries";
import type { SettingsModel } from "@/features/settings/types/settings-model";
import type { PartWorkflowMode } from "@/features/settings/types/settings-model";
import { extractApiError } from "@/lib/api-error";

export function useUpdatePartWorkflowPolicyAction() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...settingsMutations.updatePartWorkflowPolicy(),
    onSuccess: (settings) => {
      queryClient.setQueryData<SettingsModel>(settingsKeys.detail(), settings);
      toast.success("부품 워크플로 설정을 저장했습니다.");
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 워크플로 설정 저장에 실패했습니다."));
    },
  });

  return {
    ...mutation,
    updatePartWorkflowMode: (
      mode: PartWorkflowMode,
      options?: { onSuccess?: () => void },
    ) => mutation.mutate({ mode }, { onSuccess: options?.onSuccess }),
    updatePartWorkflowModeAsync: (mode: PartWorkflowMode) =>
      mutation.mutateAsync({ mode }),
  };
}
