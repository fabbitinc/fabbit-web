import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deletePartDrawing } from "@/features/parts/api/parts.api";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

export function useDeletePartDrawingItemAction(partId: string, revisionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["parts", partId, "revisions", revisionId, "delete-part-drawing-item-action"],
    mutationFn: (drawingId: string) => deletePartDrawing(partId, revisionId, drawingId),
    onSuccess: async () => {
      toast.success("도면을 삭제했습니다.");
      await invalidatePartsQueries(queryClient, partId, revisionId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "도면 삭제에 실패했습니다."));
    },
  });
}
