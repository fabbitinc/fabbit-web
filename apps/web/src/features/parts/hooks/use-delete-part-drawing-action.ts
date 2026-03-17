import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deletePartDrawing } from "@/features/parts/api/parts.api";
import { partsMutations } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

export function useDeletePartDrawingAction(partId: string, drawingId: string | null) {
  const queryClient = useQueryClient();
  const deleteDrawingMutation = partsMutations.deleteDrawing(partId, drawingId ?? "__empty__");

  return useMutation({
    mutationKey: deleteDrawingMutation.mutationKey,
    mutationFn: async () => {
      if (!drawingId) {
        throw new Error("삭제할 도면 ID가 없습니다.");
      }

      return deletePartDrawing(partId, drawingId);
    },
    onSuccess: async () => {
      toast.success("도면을 삭제했습니다.");
      await invalidatePartsQueries(queryClient, partId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "도면 삭제에 실패했습니다."));
    },
  });
}
