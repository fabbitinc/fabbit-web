import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deletePartPreviewFile } from "@/features/parts/api/parts.api";
import { partsKeys } from "@/features/parts/api/parts.queries";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import { extractApiError } from "@/lib/api-error";

export function useDeletePartPreviewFileAction(partId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["parts", partId, "delete-preview-file-action"],
    mutationFn: (previewFileId: string) => deletePartPreviewFile(partId, previewFileId),
    onSuccess: async () => {
      toast.success("미리보기 파일을 삭제했습니다.");
      await Promise.all([
        invalidatePartsQueries(queryClient, partId),
        queryClient.invalidateQueries({ queryKey: partsKeys.drawingProcessing(partId) }),
      ]);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "미리보기 파일 삭제에 실패했습니다."));
    },
  });
}
