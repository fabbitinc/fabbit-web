import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partsMutations, partsKeys } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import type { PartDetailModel } from "@/features/parts/types/parts-model";
import { extractApiError } from "@/lib/api-error";

interface UseReleasePartDraftActionOptions {
  onSuccess?: (part: PartDetailModel) => void;
}

export function useReleasePartDraftAction(
  partId: string,
  revisionId: string,
  options?: UseReleasePartDraftActionOptions,
) {
  const queryClient = useQueryClient();
  const releaseDraftMutation = partsMutations.releaseDraft(partId, revisionId);

  return useMutation({
    mutationKey: releaseDraftMutation.mutationKey,
    mutationFn: (reason: string, context: MutationFunctionContext) => {
      const mutationFn = releaseDraftMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("부품 초안 배포 mutationFn이 정의되지 않았습니다.");
      }

      return mutationFn({ reason: reason.trim() }, context);
    },
    onSuccess: async (part) => {
      toast.success("부품 초안을 배포했습니다.");
      await Promise.all([
        invalidatePartsQueries(queryClient, partId, revisionId, { includeList: true }),
        queryClient.invalidateQueries({ queryKey: partsKeys.detail(part.partId, part.revisionId) }),
      ]);
      options?.onSuccess?.(part);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 초안 배포에 실패했습니다."));
    },
  });
}
