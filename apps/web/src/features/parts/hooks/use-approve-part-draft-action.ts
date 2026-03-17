import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partsMutations, partsKeys } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import type { PartDetailModel } from "@/features/parts/types/parts-model";
import { extractApiError } from "@/lib/api-error";

interface UseApprovePartDraftActionOptions {
  onSuccess?: (part: PartDetailModel) => void;
}

export function useApprovePartDraftAction(
  partId: string,
  options?: UseApprovePartDraftActionOptions,
) {
  const queryClient = useQueryClient();
  const approveDraftMutation = partsMutations.approveDraft(partId);

  return useMutation({
    mutationKey: approveDraftMutation.mutationKey,
    mutationFn: (reason: string, context: MutationFunctionContext) => {
      const mutationFn = approveDraftMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("부품 초안 승인 mutationFn이 정의되지 않았습니다.");
      }

      return mutationFn({ reason: reason.trim() }, context);
    },
    onSuccess: async (part) => {
      toast.success("부품 초안을 승인했습니다.");
      await Promise.all([
        invalidatePartsQueries(queryClient, partId, { includeList: true }),
        queryClient.invalidateQueries({ queryKey: partsKeys.detail(part.routeId) }),
      ]);
      options?.onSuccess?.(part);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 초안 승인에 실패했습니다."));
    },
  });
}
