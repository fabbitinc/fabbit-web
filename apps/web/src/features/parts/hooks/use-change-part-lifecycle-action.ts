import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partsMutations } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { getLifecycleLabel } from "@/features/parts/lib/part-lifecycle";
import { extractApiError } from "@/lib/api-error";

interface UseChangePartLifecycleActionOptions {
  onSuccess?: () => void;
}

export function useChangePartLifecycleAction(
  partId: string,
  revisionId: string,
  options?: UseChangePartLifecycleActionOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...partsMutations.changeLifecycleState(partId),
    onSuccess: async (result) => {
      const label = getLifecycleLabel(result.lifecycleState);
      toast.success(`부품 상태를 "${label}"(으)로 변경했습니다.`);
      await invalidatePartsQueries(queryClient, partId, revisionId, {
        includeList: true,
      });
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 상태 변경에 실패했습니다."));
    },
  });
}
