import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { propertiesKeys, propertiesMutations } from "@/features/properties/api/properties.queries";
import type { ReorderPropertyRequestDto } from "@/features/properties/api/properties.types";
import { extractApiError } from "@/lib/api-error";

export function useReorderPropertiesAction() {
  const queryClient = useQueryClient();
  const reorderMutation = propertiesMutations.reorder();

  return useMutation({
    mutationKey: reorderMutation.mutationKey,
    mutationFn: reorderMutation.mutationFn,
    onSuccess: async (_data, request: ReorderPropertyRequestDto) => {
      toast.success("순서를 변경했습니다.");
      await queryClient.invalidateQueries({
        queryKey: propertiesKeys.metaScope(request.owner_type),
      });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "속성 순서 변경에 실패했습니다."));
    },
  });
}
