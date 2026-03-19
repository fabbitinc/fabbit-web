import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partsMutations } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

interface UseCancelPartDraftActionOptions {
  onSuccess?: () => void;
}

export function useCancelPartDraftAction(
  partId: string,
  revisionId: string,
  options?: UseCancelPartDraftActionOptions,
) {
  const queryClient = useQueryClient();
  const cancelDraftMutation = partsMutations.cancelDraft(partId, revisionId);

  return useMutation({
    mutationKey: cancelDraftMutation.mutationKey,
    mutationFn: (reason: string, context: MutationFunctionContext) => {
      const mutationFn = cancelDraftMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("부품 초안 폐기 mutationFn이 정의되지 않았습니다.");
      }

      return mutationFn({ reason: reason.trim() }, context);
    },
    onSuccess: async () => {
      toast.success("부품 초안을 폐기했습니다.");
      await invalidatePartsQueries(queryClient, partId, revisionId, { includeList: true });
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 초안 폐기에 실패했습니다."));
    },
  });
}
