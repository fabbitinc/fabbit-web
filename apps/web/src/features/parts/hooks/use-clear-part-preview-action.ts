import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partsKeys, partsMutations } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

export function useClearPartPreviewAction(partId: string, revisionId: string) {
  const queryClient = useQueryClient();
  const mutation = partsMutations.clearPreview(partId, revisionId);

  return useMutation({
    mutationKey: mutation.mutationKey,
    mutationFn: (_, context) => {
      const mutationFn = mutation.mutationFn;

      if (!mutationFn) {
        throw new Error("대표 미리보기 해제 mutationFn이 정의되지 않았습니다.");
      }

      return mutationFn(undefined, context);
    },
    onSuccess: async () => {
      toast.success("대표 미리보기를 해제했습니다.");
      await Promise.all([
        invalidatePartsQueries(queryClient, partId, revisionId),
        queryClient.invalidateQueries({ queryKey: partsKeys.drawingProcessing(partId, revisionId) }),
      ]);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "대표 미리보기 해제에 실패했습니다."));
    },
  });
}
