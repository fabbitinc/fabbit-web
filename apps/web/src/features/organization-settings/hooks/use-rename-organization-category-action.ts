import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  organizationSettingsKeys,
  organizationSettingsMutations,
} from "@/features/organization-settings/api/organization-settings.queries";
import { extractApiError } from "@/lib/api-error";

export function useRenameOrganizationCategoryAction() {
  const queryClient = useQueryClient();

  return useMutation({
    ...organizationSettingsMutations.renameCategory(),
    mutationKey: ["organization-settings", "rename-organization-category-action"],
    onSuccess: () => {
      toast.success("카테고리 이름을 변경했습니다.");
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.categories });
      queryClient.invalidateQueries({ queryKey: organizationSettingsKeys.defaultOwners });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "카테고리 이름 변경에 실패했습니다."));
    },
  });
}
