import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partsMutations, partsKeys } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import type { PartPreviewSourceType } from "@/features/parts/types/parts-model";
import { extractApiError } from "@/lib/api-error";

interface SelectPartPreviewSourceInput {
  sourceId: string;
  sourceType: PartPreviewSourceType;
}

export function useSelectPartPreviewSourceAction(partId: string, revisionId: string) {
  const queryClient = useQueryClient();
  const mutation = partsMutations.selectPreviewSource(partId, revisionId);

  return useMutation({
    mutationKey: mutation.mutationKey,
    mutationFn: ({ sourceId, sourceType }: SelectPartPreviewSourceInput, context) => {
      const mutationFn = mutation.mutationFn;

      if (!mutationFn) {
        throw new Error("대표 미리보기 선택 mutationFn이 정의되지 않았습니다.");
      }

      return mutationFn(
        {
          source_id: sourceId,
          source_type: sourceType,
        },
        context,
      );
    },
    onSuccess: async () => {
      toast.success("대표 미리보기를 변경했습니다.");
      await Promise.all([
        invalidatePartsQueries(queryClient, partId, revisionId),
        queryClient.invalidateQueries({ queryKey: partsKeys.drawingProcessing(partId, revisionId) }),
      ]);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "대표 미리보기 변경에 실패했습니다."));
    },
  });
}
