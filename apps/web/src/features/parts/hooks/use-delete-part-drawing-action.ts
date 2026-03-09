import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { partsMutations } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

export function useDeletePartDrawingAction(partId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    ...partsMutations.deleteDrawing(partId),
    onSuccess: async () => {
      toast.success("도면을 삭제했습니다.");
      await invalidatePartsQueries(queryClient, partId, { includeList: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "도면 삭제에 실패했습니다."));
    },
  });
}
