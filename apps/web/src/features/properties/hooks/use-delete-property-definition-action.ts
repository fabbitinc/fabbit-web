import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { propertiesKeys, propertiesMutations } from "@/features/properties/api/properties.queries";
import { extractApiError } from "@/lib/api-error";

interface UseDeletePropertyDefinitionActionOptions {
  ownerType?: string;
  onSuccess?: () => void;
}

export function useDeletePropertyDefinitionAction(options?: UseDeletePropertyDefinitionActionOptions) {
  const queryClient = useQueryClient();
  const deleteDefinitionMutation = propertiesMutations.deleteDefinition();

  return useMutation({
    mutationKey: deleteDefinitionMutation.mutationKey,
    mutationFn: deleteDefinitionMutation.mutationFn,
    onSuccess: async () => {
      toast.success("속성을 삭제했습니다.");
      await queryClient.invalidateQueries({
        queryKey: options?.ownerType
          ? propertiesKeys.metaScope(options.ownerType)
          : propertiesKeys.metaRoot,
      });
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(
        extractApiError(error, {
          fallback: "속성 삭제에 실패했습니다.",
          statusMessages: {
            409: "사용 중인 속성이라 삭제할 수 없습니다.",
          },
        }),
      );
    },
  });
}
