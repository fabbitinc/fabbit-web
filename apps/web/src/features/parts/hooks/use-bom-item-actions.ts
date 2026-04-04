import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partsKeys, partsMutations } from "@/features/parts/api/parts.queries";
import type { PartBomModel } from "@/features/parts/types/parts-model";
import { extractApiError } from "@/lib/api-error";

export { buildBomUpdateRequest as buildUpdateRequest } from "@/features/parts/lib/build-bom-update-request";

function useBomMutationCallbacks(partId: string, revisionId: string) {
  const queryClient = useQueryClient();

  return {
    onSuccess: (data: PartBomModel, successMessage: string) => {
      queryClient.setQueryData(partsKeys.bom(partId, revisionId), data);
      queryClient.invalidateQueries({
        queryKey: ["parts", partId, "revisions", revisionId, "bom-tree"],
      });
      queryClient.invalidateQueries({ queryKey: partsKeys.detail(partId, revisionId) });
      queryClient.invalidateQueries({ queryKey: partsKeys.lists() });
      toast.success(successMessage);
    },
    onError: (error: unknown, fallbackMessage: string) => {
      toast.error(extractApiError(error, fallbackMessage));
    },
  };
}

export function useAddBomItemAction(partId: string, revisionId: string) {
  const callbacks = useBomMutationCallbacks(partId, revisionId);

  return useMutation({
    ...partsMutations.addBomItem(partId, revisionId),
    onSuccess: (data) => callbacks.onSuccess(data, "BOM 항목을 추가했습니다."),
    onError: (error) => callbacks.onError(error, "BOM 항목 추가에 실패했습니다."),
  });
}

export function useAddBomItemsBatchAction(partId: string, revisionId: string) {
  const callbacks = useBomMutationCallbacks(partId, revisionId);

  return useMutation({
    ...partsMutations.addBomItemsBatch(partId, revisionId),
    onSuccess: (data) => callbacks.onSuccess(data, "BOM 항목을 일괄 추가했습니다."),
    onError: (error) => callbacks.onError(error, "BOM 항목 일괄 추가에 실패했습니다."),
  });
}

export function useUpdateBomItemAction(partId: string, revisionId: string) {
  const callbacks = useBomMutationCallbacks(partId, revisionId);

  return useMutation({
    ...partsMutations.updateBomItem(partId, revisionId),
    onSuccess: (data) => callbacks.onSuccess(data, "BOM 항목을 수정했습니다."),
    onError: (error) => callbacks.onError(error, "BOM 항목 수정에 실패했습니다."),
  });
}

export function useDeleteBomItemAction(partId: string, revisionId: string) {
  const callbacks = useBomMutationCallbacks(partId, revisionId);

  return useMutation({
    ...partsMutations.deleteBomItem(partId, revisionId),
    onSuccess: (data) => callbacks.onSuccess(data, "BOM 항목을 삭제했습니다."),
    onError: (error) => callbacks.onError(error, "BOM 항목 삭제에 실패했습니다."),
  });
}

