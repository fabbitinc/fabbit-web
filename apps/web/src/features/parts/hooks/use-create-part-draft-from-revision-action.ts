import { type MutationFunctionContext, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partsMutations, partsKeys } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import type { PartDetailModel } from "@/features/parts/types/parts-model";
import { extractApiError } from "@/lib/api-error";

interface UseCreatePartDraftFromRevisionActionOptions {
  onSuccess?: (part: PartDetailModel) => void;
}

export function useCreatePartDraftFromRevisionAction(
  partId: string,
  options?: UseCreatePartDraftFromRevisionActionOptions,
) {
  const queryClient = useQueryClient();
  const createDraftMutation = partsMutations.createDraftFromRevision(partId);

  return useMutation({
    mutationKey: createDraftMutation.mutationKey,
    mutationFn: (_: void, context: MutationFunctionContext) => {
      const mutationFn = createDraftMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("부품 개정 초안 생성 mutationFn이 정의되지 않았습니다.");
      }

      return mutationFn({}, context);
    },
    onSuccess: async (part) => {
      toast.success("개정 초안을 생성했습니다.");
      await Promise.all([
        invalidatePartsQueries(queryClient, partId, { includeList: true }),
        queryClient.invalidateQueries({ queryKey: partsKeys.detail(part.routeId) }),
      ]);
      options?.onSuccess?.(part);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "개정 초안 생성에 실패했습니다."));
    },
  });
}
